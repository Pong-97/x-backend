const Address = require('../../models/Address');
const User = require('../../models/User');

/**
 * 获取地址列表（按用户）
 */
exports.getAddressList = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        code: 400,
        message: '用户ID不能为空',
        data: null
      });
    }

    const addresses = await Address.find({ userId: parseInt(userId) })
      .select('-__v')
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    res.json({
      code: 200,
      message: '获取成功',
      data: addresses
    });
  } catch (error) {
    console.error('获取地址列表错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取地址列表失败',
      data: null
    });
  }
};

/**
 * 获取地址详情
 */
exports.getAddressDetail = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await Address.findOne({ addressId: parseInt(addressId) })
      .select('-__v')
      .lean();

    if (!address) {
      return res.status(404).json({
        code: 404,
        message: '地址不存在',
        data: null
      });
    }

    // 获取用户信息
    const user = await User.findOne({ userId: address.userId })
      .select('userId username')
      .lean();

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...address,
        user
      }
    });
  } catch (error) {
    console.error('获取地址详情错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取地址详情失败',
      data: null
    });
  }
};
