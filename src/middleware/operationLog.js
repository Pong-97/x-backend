const AdminLog = require('../models/AdminLog');

/**
 * 操作日志记录中间件工厂函数
 * @param {string} module - 模块名称 (user, product, order, category, banner, system)
 * @param {string} action - 操作类型 (create, update, delete, status, export)
 * @param {function} getContent - 可选的内容生成函数，接收 req 参数
 */
const operationLog = (module, action, getContent = null) => {
  return async (req, res, next) => {
    // 保存原始的 res.json 方法
    const originalJson = res.json.bind(res);

    // 重写 res.json 方法
    res.json = function(data) {
      // 只在成功时记录日志（code为200或2xx）
      if (data && (data.code === 200 || (data.code >= 200 && data.code < 300))) {
        // 异步记录日志，不阻塞响应
        setImmediate(async () => {
          try {
            if (!req.admin) {
              return; // 如果没有管理员信息，不记录
            }

            // 提取目标ID
            let targetId = req.params.id || 
                          req.params.userId || 
                          req.params.productId || 
                          req.params.orderId || 
                          req.params.categoryId || 
                          req.params.bannerId ||
                          req.body.id ||
                          '';

            // 生成操作内容描述
            let content = '';
            if (getContent && typeof getContent === 'function') {
              content = getContent(req);
            } else {
              // 默认内容生成
              content = generateDefaultContent(module, action, req);
            }

            // 创建日志记录
            await AdminLog.create({
              adminId: req.admin.adminId,
              adminName: req.admin.username,
              action: action,
              module: module,
              targetId: targetId ? String(targetId) : '',
              content: content,
              ip: req.adminIp || req.ip,
              userAgent: req.headers['user-agent'] || ''
            });
          } catch (error) {
            console.error('记录操作日志失败:', error);
            // 日志记录失败不影响业务
          }
        });
      }

      // 调用原始的 json 方法
      return originalJson(data);
    };

    next();
  };
};

/**
 * 生成默认的操作内容描述
 */
function generateDefaultContent(module, action, req) {
  const actionMap = {
    create: '创建',
    update: '更新',
    delete: '删除',
    status: '修改状态',
    export: '导出数据',
    login: '登录',
    logout: '登出'
  };

  const moduleMap = {
    user: '用户',
    product: '商品',
    order: '订单',
    category: '分类',
    banner: '轮播图',
    address: '地址',
    system: '系统配置',
    admin: '管理员'
  };

  const actionText = actionMap[action] || action;
  const moduleText = moduleMap[module] || module;

  let content = `${actionText}${moduleText}`;

  // 添加详细信息
  if (req.params.id || req.params.userId || req.params.productId) {
    const id = req.params.id || req.params.userId || req.params.productId;
    content += ` (ID: ${id})`;
  }

  if (action === 'status' && req.body.status !== undefined) {
    const statusMap = {
      0: '禁用',
      1: '启用',
      2: '待发货',
      3: '待收货',
      4: '已完成',
      5: '已取消'
    };
    content += ` - ${statusMap[req.body.status] || req.body.status}`;
  }

  return content;
}

module.exports = operationLog;
