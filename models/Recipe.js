import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  ingredients: [
    {
      text: { type: String, required: true }
    }
  ],
  steps: [
    {
      text: { type: String, required: true },
      order: { type: Number }
    }
  ],
  image: String,
  videoUrl: String,
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }
  ],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
}, { timestamps: true });

const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);
export default Recipe;
