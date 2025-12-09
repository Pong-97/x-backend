/**
 * 辅助工具函数
 */

// 生成订单号
exports.generateOrderNo = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${timestamp}${random}`;
};

// 获取状态文本
exports.getOrderStatusText = (status) => {
  const statusMap = {
    1: '待付款',
    2: '待发货',
    3: '待收货',
    4: '已完成',
    5: '已取消'
  };
  return statusMap[status] || '未知状态';
};

// 构建树形结构
exports.buildTree = (items, parentId = 0) => {
  const tree = [];
  
  for (const item of items) {
    if (item.parentId === parentId) {
      const children = exports.buildTree(items, item.categoryId);
      const node = {
        id: item.categoryId,
        name: item.name,
        icon: item.icon,
        parentId: item.parentId
      };
      
      if (children.length > 0) {
        node.children = children;
      }
      
      tree.push(node);
    }
  }
  
  return tree;
};

// 生成默认头像URL
exports.getDefaultAvatar = (email) => {
  if (email) {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
  }
  return 'https://www.gravatar.com/avatar/default?d=mp';
};
