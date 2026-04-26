import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: Number,
  category: String,
  image: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;
