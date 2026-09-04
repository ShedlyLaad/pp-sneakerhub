const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: 'Home' },
    line1: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
    addresses: { type: [addressSchema], default: [] },
    favorites: { type: [mongoose.Schema.Types.ObjectId], ref: 'Product', default: [] },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    addresses: (this.addresses || []).map((a) => ({
      id: a._id.toString(),
      label: a.label,
      line1: a.line1,
      city: a.city,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    })),
    favoriteIds: (this.favorites || []).map((id) => id.toString()),
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
