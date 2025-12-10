const Order = require('../../models/Order');
const OrderItem = require('../../models/OrderItem');
const User = require('../../models/User');
const moment = require('moment');

/**
 * 获取订单列表（分页、搜索、筛选）
 */
exports.getOrderList = async (req, res) => {
  try {
    const {
      page = 1,
      size = 20,
      keyword = '',
      status = '',
      startDate = '',
      endDate = '',
      userId = ''
    } = req.query;

    // 构建查询条件
    const query = { deleted: false };

    // 关键词搜索（订单号）
    if (keyword) {
      query.orderNo = { $regex: keyword, $options: 'i' };
    }

    // 状态筛选
    if (status !== '') {
      query.status = parseInt(status);
    }

    // 用户ID筛选
    if (userId) {
      query.userId = parseInt(userId);
    }

    // 日期范围筛选
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate + ' 23:59:59');
      }
    }

    // 分页参数
    const pageNum = Math.max(1, parseInt(page));
    const pageSize = Math.min(100, Math.max(1, parseInt(size)));
    const skip = (pageNum - 1) * pageSize;

    // 查询数据
    const [list, total] = await Promise.all([
      Order.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Order.countDocuments(query)
    ]);

    // 获取用户信息
    const userIds = [...new Set(list.map(order => order.userId))];
    const users = await User.find({ userId: { $in: userIds } })
      .select('userId username')
      .lean();
    const userMap = users.reduce((map, user) => {
      map[user.userId] = user;
      return map;
    }, {});

    // 关联用户信息
    list.forEach(order => {
      order.user = userMap[order.userId] || null;
    });

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list,
        pagination: {
          page: pageNum,
          size: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取订单列表失败',
      data: null
    });
  }
};

/**
 * 获取订单详情
 */
exports.getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 查询订单
    const order = await Order.findOne({
      orderId: parseInt(orderId),
      deleted: false
    }).select('-__v').lean();

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null
      });
    }

    // 查询订单商品
    const items = await OrderItem.find({ orderId: parseInt(orderId) })
      .select('-__v')
      .lean();

    // 查询用户信息
    const user = await User.findOne({ userId: order.userId })
      .select('userId username email phone')
      .lean();

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...order,
        items,
        user
      }
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取订单详情失败',
      data: null
    });
  }
};

/**
 * 更新订单状态
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // 参数验证
    if (![1, 2, 3, 4, 5].includes(parseInt(status))) {
      return res.status(400).json({
        code: 400,
        message: '状态参数错误',
        data: null
      });
    }

    const order = await Order.findOne({
      orderId: parseInt(orderId),
      deleted: false
    });

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null
      });
    }

    // 状态流转验证
    const newStatus = parseInt(status);
    const statusFlow = {
      1: [2, 5], // 待付款 -> 待发货、已取消
      2: [3, 5], // 待发货 -> 待收货、已取消
      3: [4],    // 待收货 -> 已完成
      4: [],     // 已完成（终态）
      5: []      // 已取消（终态）
    };

    if (!statusFlow[order.status].includes(newStatus)) {
      return res.status(400).json({
        code: 400,
        message: '订单状态流转不合法',
        data: null
      });
    }

    // 更新状态
    order.status = newStatus;
    order.updatedAt = new Date();

    // 记录时间戳
    if (newStatus === 2) {
      order.paymentTime = new Date();
    } else if (newStatus === 3) {
      order.deliveryTime = new Date();
    } else if (newStatus === 4) {
      order.receiveTime = new Date();
    } else if (newStatus === 5) {
      order.cancelTime = new Date();
    }

    await order.save();

    res.json({
      code: 200,
      message: '状态更新成功',
      data: order
    });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({
      code: 500,
      message: '更新订单状态失败',
      data: null
    });
  }
};

/**
 * 订单发货
 */
exports.deliverOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { expressCompany, expressNo } = req.body;

    if (!expressCompany || !expressNo) {
      return res.status(400).json({
        code: 400,
        message: '物流公司和物流单号不能为空',
        data: null
      });
    }

    const order = await Order.findOne({
      orderId: parseInt(orderId),
      deleted: false
    });

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null
      });
    }

    if (order.status !== 2) {
      return res.status(400).json({
        code: 400,
        message: '只有待发货订单可以发货',
        data: null
      });
    }

    // 更新订单状态为待收货
    order.status = 3;
    order.deliveryTime = new Date();
    order.updatedAt = new Date();
    // 可以扩展物流信息字段
    order.expressCompany = expressCompany;
    order.expressNo = expressNo;

    await order.save();

    res.json({
      code: 200,
      message: '发货成功',
      data: order
    });
  } catch (error) {
    console.error('订单发货错误:', error);
    res.status(500).json({
      code: 500,
      message: '订单发货失败',
      data: null
    });
  }
};

/**
 * 取消订单
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({
      orderId: parseInt(orderId),
      deleted: false
    });

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在',
        data: null
      });
    }

    if (![1, 2].includes(order.status)) {
      return res.status(400).json({
        code: 400,
        message: '只有待付款或待发货订单可以取消',
        data: null
      });
    }

    order.status = 5;
    order.cancelTime = new Date();
    order.cancelReason = reason || '管理员取消';
    order.updatedAt = new Date();

    await order.save();

    res.json({
      code: 200,
      message: '订单已取消',
      data: order
    });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      code: 500,
      message: '取消订单失败',
      data: null
    });
  }
};

/**
 * 获取订单统计数据
 */
exports.getOrderStatistics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 统计数据
    const [
      totalOrders,
      todayOrders,
      monthOrders,
      pendingPayment,
      pendingDelivery,
      pendingReceive,
      todaySales,
      monthSales
    ] = await Promise.all([
      Order.countDocuments({ deleted: false }),
      Order.countDocuments({ deleted: false, createdAt: { $gte: today } }),
      Order.countDocuments({ deleted: false, createdAt: { $gte: thisMonth } }),
      Order.countDocuments({ deleted: false, status: 1 }),
      Order.countDocuments({ deleted: false, status: 2 }),
      Order.countDocuments({ deleted: false, status: 3 }),
      Order.aggregate([
        { $match: { deleted: false, createdAt: { $gte: today }, status: { $in: [2, 3, 4] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { deleted: false, createdAt: { $gte: thisMonth }, status: { $in: [2, 3, 4] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    // 近7天订单趋势
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const trendData = await Order.aggregate([
      {
        $match: {
          deleted: false,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        overview: {
          totalOrders,
          todayOrders,
          monthOrders,
          pendingPayment,
          pendingDelivery,
          pendingReceive,
          todaySales: todaySales[0]?.total || 0,
          monthSales: monthSales[0]?.total || 0
        },
        trend: trendData
      }
    });
  } catch (error) {
    console.error('获取订单统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取订单统计失败',
      data: null
    });
  }
};
