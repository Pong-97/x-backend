const AdminLog = require('../../models/AdminLog');

/**
 * 获取操作日志列表
 */
exports.getLogList = async (req, res) => {
  try {
    const {
      page = 1,
      size = 20,
      adminId = '',
      module = '',
      action = '',
      startDate = '',
      endDate = ''
    } = req.query;

    // 构建查询条件
    const query = {};

    if (adminId) {
      query.adminId = parseInt(adminId);
    }

    if (module) {
      query.module = module;
    }

    if (action) {
      query.action = action;
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
      AdminLog.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      AdminLog.countDocuments(query)
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
    console.error('获取操作日志错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取操作日志失败',
      data: null
    });
  }
};

/**
 * 获取日志详情
 */
exports.getLogDetail = async (req, res) => {
  try {
    const { logId } = req.params;

    const log = await AdminLog.findOne({ logId: parseInt(logId) })
      .select('-__v')
      .lean();

    if (!log) {
      return res.status(404).json({
        code: 404,
        message: '日志不存在',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: log
    });
  } catch (error) {
    console.error('获取日志详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取日志详情失败',
      data: null
    });
  }
};

/**
 * 获取日志统计
 */
exports.getLogStatistics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 今日日志统计
    const todayLogs = await AdminLog.countDocuments({
      createdAt: { $gte: today }
    });

    // 按模块统计
    const moduleStats = await AdminLog.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 按操作类型统计
    const actionStats = await AdminLog.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 活跃管理员统计
    const activeAdmins = await AdminLog.aggregate([
      { $match: { createdAt: { $gte: today } } },
      {
        $group: {
          _id: { adminId: '$adminId', adminName: '$adminName' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        todayLogs,
        moduleStats,
        actionStats,
        activeAdmins: activeAdmins.map(item => ({
          adminId: item._id.adminId,
          adminName: item._id.adminName,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('获取日志统计错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取日志统计失败',
      data: null
    });
  }
};
