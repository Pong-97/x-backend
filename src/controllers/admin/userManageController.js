const User = require('../../models/User');
const Order = require('../../models/Order');

/**
 * 获取用户列表（分页、搜索、筛选）
 */
exports.getUserList = async (req, res) => {
  try {
    const {
      page = 1,
      size = 20,
      keyword = '',
      status = '',
      startDate = '',
      endDate = ''
    } = req.query;

    // 构建查询条件
    const query = {};

    // 关键词搜索（用户名、邮箱、手机号）
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 状态筛选
    if (status !== '') {
      query.status = parseInt(status);
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
      User.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      User.countDocuments(query)
    ]);

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
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户列表失败',
      data: null
    });
  }
};

/**
 * 获取用户详情
 */
exports.getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    // 查询用户信息
    const user = await User.findOne({ userId: parseInt(userId) })
      .select('-password -__v')
      .lean();

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    // 查询用户订单统计
    const orderStats = await Order.aggregate([
      { $match: { userId: parseInt(userId), deleted: false } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 4] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalAmount: 0,
      completedOrders: 0
    };

    // 查询最近订单
    const recentOrders = await Order.find({
      userId: parseInt(userId),
      deleted: false
    })
      .select('orderId orderNo status totalAmount createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        user,
        stats,
        recentOrders
      }
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户详情失败',
      data: null
    });
  }
};

/**
 * 修改用户状态（启用/禁用）
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    // 参数验证
    if (status === undefined || ![0, 1].includes(parseInt(status))) {
      return res.status(400).json({
        code: 400,
        message: '状态参数错误，必须为0或1',
        data: null
      });
    }

    // 更新用户状态
    const user = await User.findOneAndUpdate(
      { userId: parseInt(userId) },
      { status: parseInt(status), updatedAt: new Date() },
      { new: true }
    ).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '状态更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      code: 500,
      message: '更新用户状态失败',
      data: null
    });
  }
};

/**
 * 获取用户统计数据
 */
exports.getUserStatistics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 统计数据
    const [
      totalUsers,
      activeUsers,
      todayUsers,
      monthUsers,
      disabledUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 1 }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({ status: 0 })
    ]);

    // 近7天用户增长趋势
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const trendData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        overview: {
          totalUsers,
          activeUsers,
          todayUsers,
          monthUsers,
          disabledUsers
        },
        trend: trendData
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户统计失败',
      data: null
    });
  }
};
