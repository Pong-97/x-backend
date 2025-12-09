const Cart = require('../models/Cart');
const Product = require('../models/Product');

// 获取购物车列表
exports.getCartList = async (req, res) => {
  try {
    const carts = await Cart.find({ userId: req.userId }).select('-_id -__v');

    // 关联查询商品信息
    const cartList = await Promise.all(
      carts.map(async (cart) => {
        const product = await Product.findOne({ productId: cart.productId });
        
        if (!product) {
          return null;
        }

        return {
          id: cart.cartId,
          productId: cart.productId,
          productName: product.name,
          productImage: product.image,
          price: product.price,
          quantity: cart.quantity,
          selected: cart.selected,
          stock: product.stock
        };
      })
    );

    // 过滤掉商品不存在的项
    const validCartList = cartList.filter(item => item !== null);

    res.success(validCartList);
  } catch (error) {
    console.error('获取购物车列表错误:', error);
    res.error(error.message, 500);
  }
};

// 添加到购物车
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.error('商品ID不能为空', 400);
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.error('数量必须为正整数', 400);
    }

    // 查询商品
    const product = await Product.findOne({ productId, status: 1 });
    if (!product) {
      return res.error('商品不存在或已下架', 400);
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.error('库存不足', 400);
    }

    // 检查购物车中是否已有该商品
    const existingCart = await Cart.findOne({ 
      userId: req.userId, 
      productId 
    });

    if (existingCart) {
      // 更新数量
      const newQuantity = existingCart.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.error('库存不足', 400);
      }

      existingCart.quantity = newQuantity;
      existingCart.updatedAt = new Date();
      await existingCart.save();

      return res.success({ cartId: existingCart.cartId }, '添加成功');
    }

    // 创建新购物车项
    const cart = new Cart({
      userId: req.userId,
      productId,
      quantity
    });

    await cart.save();

    res.success({ cartId: cart.cartId }, '添加成功');
  } catch (error) {
    console.error('添加到购物车错误:', error);
    res.error(error.message, 500);
  }
};

// 更新购物车
exports.updateCart = async (req, res) => {
  try {
    const { cartId, quantity, selected } = req.body;

    if (!cartId) {
      return res.error('购物车ID不能为空', 400);
    }

    // 查询购物车项
    const cart = await Cart.findOne({ cartId });
    if (!cart) {
      return res.error('购物车项不存在', 404);
    }

    // 权限验证
    if (cart.userId !== req.userId) {
      return res.error('无权限操作', 403);
    }

    // 更新数量
    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.error('数量必须为正整数', 400);
      }

      // 检查库存
      const product = await Product.findOne({ productId: cart.productId });
      if (!product) {
        return res.error('商品不存在', 404);
      }

      if (quantity > product.stock) {
        return res.error('库存不足', 400);
      }

      cart.quantity = quantity;
    }

    // 更新选中状态
    if (selected !== undefined) {
      cart.selected = selected;
    }

    cart.updatedAt = new Date();
    await cart.save();

    res.success(null, '更新成功');
  } catch (error) {
    console.error('更新购物车错误:', error);
    res.error(error.message, 500);
  }
};

// 删除购物车商品
exports.deleteCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({ cartId: parseInt(id) });
    if (!cart) {
      return res.error('购物车项不存在', 404);
    }

    // 权限验证
    if (cart.userId !== req.userId) {
      return res.error('无权限操作', 403);
    }

    await Cart.deleteOne({ cartId: parseInt(id) });

    res.success(null, '删除成功');
  } catch (error) {
    console.error('删除购物车商品错误:', error);
    res.error(error.message, 500);
  }
};
