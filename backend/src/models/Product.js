const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    // Optional pre-discount reference price. When set and greater than `price`,
    // the client can show a strikethrough price and a discount percentage.
    compareAtPrice: { type: Number, default: null, min: 0 },
    brand: { type: String, trim: true, default: '', index: true },
    image: { type: String, default: null }, // URI (local file uri or remote URL)
    storeLocation: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: 'general', index: true },
    stock: { type: Number, default: 0, min: 0 },
    // Curated flag an admin sets to surface a product in the "Featured" landing
    // section. Not derived from sales - a deliberate merchandising choice.
    featured: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

productSchema.methods.toClientJSON = function toClientJSON() {
  const hasDiscount = this.compareAtPrice != null && this.compareAtPrice > this.price;
  return {
    id: this._id.toString(),
    name: this.name,
    description: this.description,
    price: this.price,
    compareAtPrice: this.compareAtPrice,
    discountPercent: hasDiscount
      ? Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100)
      : null,
    brand: this.brand,
    image: this.image,
    storeLocation: this.storeLocation,
    category: this.category,
    stock: this.stock,
    inStock: this.stock > 0,
    featured: this.featured,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Product', productSchema);
