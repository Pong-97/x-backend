const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Address = require('../models/Address');
const { generateOrderNo, getOrderStatusText } = require('../utils/helpers');

// 创建订单
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { addressId, cartIds, remark } = req.body;

    // 参数验证
    if (!addressId) {
      await session.abortTransaction();
      return res.error('收货地址不能为空', 400);
    }

    if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      await session.abortTransaction();
      return res.error('购物车项不能为空', 400);
    }

    // 查询地址
    const address = await Address.findOne({ addressId, userId: req.userId });
    if (!address) {
      await session.abortTransaction();
      return res.error('收货地址不存在', 400);
    }

    // 查询购物车项
    const carts = await Cart.find({ 
      cartId: { $in: cartIds },
      userId: req.userId 
    });

    if (carts.length === 0) {
      await session.abortTransaction();
      return res.error('购物车项不存在', 400);
    }

    // 查询商品并检查库存
    let totalAmount = 0;
    const orderItems = [];

    for (const cart of carts) {
      const product = await Product.findOne({ productId: cart.productId });
      
      if (!product) {
        await session.abortTransaction();
        return res.error(`商品不存在`, 400);
      }

      if (product.status !== 1) {
        await session.abortTransaction();
        return res.error(`商品 ${product.name} 已下架`, 400);
      }

      if (product.stock < cart.quantity) {
        await session.abortTransaction();
        return res.error(`商品 ${product.name} 库存不足`, 400);
      }

      const subtotal = product.price * cart.quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.productId,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: cart.quantity,
        subtotal,
        specs: product.specs
      });

      // 扣减库存
      await Product.findOneAndUpdate(
        { productId: product.productId },
        { $inc: { stock: -cart.quantity } },
        { session }
      );
    }

    // 创建订单
    const order = new Order({
      orderNo: generateOrderNo(),
      userId: req.userId,
      status: 1,
      totalAmount,
      remark,
      address: {
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail
      }
    });

    await order.save({ session });

    // 创建订单商品
    for (const item of orderItems) {
      const orderItem = new OrderItem({
        orderId: order.orderId,
        ...item
      });
      await orderItem.save({ session });
    }

    // 删除购物车项
    await Cart.deleteMany(
      { cartId: { $in: cartIds } },
      { session }
    );

    await session.commitTransaction();

    res.success({
      orderId: order.orderId,
      orderNo: order.orderNo
    }, '订单创建成功');
  } catch (error) {
    await session.abortTransaction();
    console.error('创建订单错误:', error);
    res.error(error.message, 500);
  } finally {
    session.endSession();
  }
};

// 获取订单列表
exports.getOrderList = async (req, res) => {
  try {
    const { status = 0, page = 1, pageSize = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limit = Math.max(1, parseInt(pageSize));
    const skip = (pageNum - 1) * limit;

    // 构建查询条件
    const query = { userId: req.userId, deleted: false };
    if (parseInt(status) > 0) {
      query.status = parseInt(status);
    }

    // 查询订单
    const orders = await Order.find(query)
      .select('-_id -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    // 关联查询订单商品
    const list = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order.orderId })
          .select('-_id -__v -itemId -orderId');

        return {
          id: order.orderId,
          orderNo: order.orderNo,
          status: order.status,
          statusText: getOrderStatusText(order.status),
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity
          }))
        };
      })
    );

    res.success({ list, total });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.error(error.message, 500);
  }
};

// 获取订单详情
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ orderId: parseInt(id) })
      .select('-_id -__v');

    if (!order) {
      return res.error('订单不存在', 404);
    }

    // 权限验证
    if (order.userId !== req.userId) {
      return res.error('无权限访问', 403);
    }

    // 查询订单商品
    const items = await OrderItem.find({ orderId: order.orderId })
      .select('-_id -__v -itemId -orderId');

    res.success({
      id: order.orderId,
      orderNo: order.orderNo,
      status: order.status,
      statusText: getOrderStatusText(order.status),
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      address: order.address,
      items,
      remark: order.remark
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.error(error.message, 500);
  }
};

// 取消订单
exports.cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const order = await Order.findOne({ orderId: parseInt(id) });
    if (!order) {
      await session.abortTransaction();
      return res.error('订单不存在', 404);
    }

    // 权限验证
    if (order.userId !== req.userId) {
      await session.abortTransaction();
      return res.error('无权限操作', 403);
    }

    // 状态验证
    if (order.status !== 1) {
      await session.abortTransaction();
      return res.error('订单状态不允许取消', 400);
    }

    // 查询订单商品并恢复库存
    const items = await OrderItem.find({ orderId: order.orderId });
    for (const item of items) {
      await Product.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { stock: item.quantity } },
        { session }
      );
    }

    // 更新订单状态
    order.status = 5;
    order.cancelTime = new Date();
    order.updatedAt = new Date();
    await order.save({ session });

    await session.commitTransaction();

    res.success(null, '订单已取消');
  } catch (error) {
    await session.abortTransaction();
    console.error('取消订单错误:', error);
    res.error(error.message, 500);
  } finally {
    session.endSession();
  }
};

// 确认收货
exports.confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ orderId: parseInt(id) });
    if (!order) {
      return res.error('订单不存在', 404);
    }

    // 权限验证
    if (order.userId !== req.userId) {
      return res.error('无权限操作', 403);
    }

    // 状态验证
    if (order.status !== 3) {
      return res.error('订单状态不允许确认收货', 400);
    }

    // 更新订单状态
    order.status = 4;
    order.receiveTime = new Date();
    order.updatedAt = new Date();
    await order.save();

    // 增加商品销量
    const items = await OrderItem.find({ orderId: order.orderId });
    for (const item of items) {
      await Product.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { sales: item.quantity } }
      );
    }

    res.success(null, '确认收货成功');
  } catch (error) {
    console.error('确认收货错误:', error);
    res.error(error.message, 500);
  }
};

// 删除订单
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ orderId: parseInt(id) });
    if (!order) {
      return res.error('订单不存在', 404);
    }

    // 权限验证
    if (order.userId !== req.userId) {
      return res.error('无权限操作', 403);
    }

    // 状态验证
    if (order.status !== 4 && order.status !== 5) {
      return res.error('订单状态不允许删除', 400);
    }

    // 软删除
    order.deleted = true;
    order.updatedAt = new Date();
    await order.save();

    res.success(null, '删除成功');
  } catch (error) {
    console.error('删除订单错误:', error);
    res.error(error.message, 500);
  }
};
