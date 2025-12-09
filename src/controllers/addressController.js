const Address = require('../models/Address');
const { validatePhone } = require('../utils/validator');

// 获取地址列表
exports.getAddressList = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.userId })
      .select('-_id -__v')
      .sort({ isDefault: -1, createdAt: -1 });

    const list = addresses.map(addr => ({
      id: addr.addressId,
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault
    }));

    res.success(list);
  } catch (error) {
    console.error('获取地址列表错误:', error);
    res.error(error.message, 500);
  }
};

// 添加地址
exports.addAddress = async (req, res) => {
  try {
    const { name, phone, province, city, district, detail, isDefault } = req.body;

    // 参数验证
    if (!name || name.length < 2 || name.length > 20) {
      return res.error('收货人姓名长度必须在2-20个字符之间', 400);
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      return res.error(phoneError, 400);
    }

    if (!province || !city || !district || !detail) {
      return res.error('地址信息不完整', 400);
    }

    // 如果设置为默认地址，取消其他默认地址
    if (isDefault) {
      await Address.updateMany(
        { userId: req.userId },
        { isDefault: false }
      );
    }

    // 如果是第一个地址，自动设为默认
    const count = await Address.countDocuments({ userId: req.userId });
    const shouldBeDefault = count === 0 || isDefault;

    const address = new Address({
      userId: req.userId,
      name,
      phone,
      province,
      city,
      district,
      detail,
      isDefault: shouldBeDefault
    });

    await address.save();

    res.success({ addressId: address.addressId }, '添加成功');
  } catch (error) {
    console.error('添加地址错误:', error);
    res.error(error.message, 500);
  }
};

// 更新地址
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, province, city, district, detail, isDefault } = req.body;

    const address = await Address.findOne({ addressId: parseInt(id) });
    if (!address) {
      return res.error('地址不存在', 404);
    }

    // 权限验证
    if (address.userId !== req.userId) {
      return res.error('无权限操作', 403);
    }

    // 参数验证
    if (name && (name.length < 2 || name.length > 20)) {
      return res.error('收货人姓名长度必须在2-20个字符之间', 400);
    }

    if (phone) {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        return res.error(phoneError, 400);
      }
    }

    // 如果设置为默认地址，取消其他默认地址
    if (isDefault) {
      await Address.updateMany(
        { userId: req.userId, addressId: { $ne: parseInt(id) } },
        { isDefault: false }
      );
    }

    // 更新地址
    if (name) address.name = name;
    if (phone) address.phone = phone;
    if (province) address.province = province;
    if (city) address.city = city;
    if (district) address.district = district;
    if (detail) address.detail = detail;
    if (isDefault !== undefined) address.isDefault = isDefault;
    address.updatedAt = new Date();

    await address.save();

    res.success(null, '更新成功');
  } catch (error) {
    console.error('更新地址错误:', error);
    res.error(error.message, 500);
  }
};

// 删除地址
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ addressId: parseInt(id) });
    if (!address) {
      return res.error('地址不存在', 404);
    }

    // 权限验证
    if (address.userId !== req.userId) {
      return res.error('无权限操作', 403);
    }

    const wasDefault = address.isDefault;
    await Address.deleteOne({ addressId: parseInt(id) });

    // 如果删除的是默认地址，将第一个地址设为默认
    if (wasDefault) {
      const firstAddress = await Address.findOne({ userId: req.userId })
        .sort({ createdAt: 1 });
      
      if (firstAddress) {
        firstAddress.isDefault = true;
        await firstAddress.save();
      }
    }

    res.success(null, '删除成功');
  } catch (error) {
    console.error('删除地址错误:', error);
    res.error(error.message, 500);
  }
};

// 设置默认地址
exports.setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ addressId: parseInt(id) });
    if (!address) {
      return res.error('地址不存在', 404);
    }

    // 权限验证
    if (address.userId !== req.userId) {
      return res.error('无权限操作', 403);
    }

    // 取消所有默认地址
    await Address.updateMany(
      { userId: req.userId },
      { isDefault: false }
    );

    // 设置当前地址为默认
    address.isDefault = true;
    address.updatedAt = new Date();
    await address.save();

    res.success(null, '设置成功');
  } catch (error) {
    console.error('设置默认地址错误:', error);
    res.error(error.message, 500);
  }
};
