const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: null }, // URI (local file uri or remote URL)
    storeLocation: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'general', index: true },
    stock: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

productSchema.methods.toClientJSON = function toClientJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    description: this.description,
    price: this.price,
    image: this.image,
    storeLocation: this.storeLocation,
    category: this.category,
    stock: this.stock,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Product', productSchema);
