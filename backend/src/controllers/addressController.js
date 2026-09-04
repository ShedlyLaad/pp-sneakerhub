const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function serializeAddress(a) {
  return {
    id: a._id.toString(),
    label: a.label,
    line1: a.line1,
    city: a.city,
    postalCode: a.postalCode,
    country: a.country,
    isDefault: a.isDefault,
  };
}

const listAddresses = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.addresses.map(serializeAddress) });
});

const createAddress = asyncHandler(async (req, res) => {
  const { label, line1, city, postalCode, country, isDefault } = req.body;
  if (!line1 || !city || !country) {
    throw new ApiError(400, 'line1, city and country are required');
  }

  // First address a user ever saves becomes the default automatically, so
  // checkout always has something to preselect.
  const makeDefault = isDefault === true || req.user.addresses.length === 0;
  if (makeDefault) {
    req.user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  req.user.addresses.push({
    label: label?.trim() || 'Home',
    line1: line1.trim(),
    city: city.trim(),
    postalCode: (postalCode || '').trim(),
    country: country.trim(),
    isDefault: makeDefault,
  });
  await req.user.save();

  const created = req.user.addresses[req.user.addresses.length - 1];
  res.status(201).json({ success: true, data: serializeAddress(created) });
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = req.user.addresses.id(req.params.id);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  const { label, line1, city, postalCode, country, isDefault } = req.body;
  if (label !== undefined) address.label = label.trim();
  if (line1 !== undefined) address.line1 = line1.trim();
  if (city !== undefined) address.city = city.trim();
  if (postalCode !== undefined) address.postalCode = postalCode.trim();
  if (country !== undefined) address.country = country.trim();
  if (isDefault === true) {
    req.user.addresses.forEach((a) => {
      a.isDefault = String(a._id) === String(address._id);
    });
  }

  await req.user.save();
  res.json({ success: true, data: serializeAddress(address) });
});

const deleteAddress = asyncHandler(async (req, res) => {
  const address = req.user.addresses.id(req.params.id);
  if (!address) {
    throw new ApiError(404, 'Address not found');
  }
  const wasDefault = address.isDefault;
  address.deleteOne();

  // Keep exactly one default address around whenever any are left.
  if (wasDefault && req.user.addresses.length > 0) {
    req.user.addresses[0].isDefault = true;
  }

  await req.user.save();
  res.json({ success: true, data: null });
});

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress };
