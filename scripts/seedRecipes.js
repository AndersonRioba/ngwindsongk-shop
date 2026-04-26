const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models (Defined inline to ensure compatibility with standalone execution)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: Number,
  category: String,
  image: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });

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

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', RecipeSchema);

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/windsong';
const JSON_PATH = path.join(__dirname, '../seeds/recipes.seed.json');

async function seedRecipes() {
  console.log('🚀 Starting Recipe Seeding...');
  
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log("Connected to DB:", mongoose.connection.name);

    // 2. Print Available Products
    const productsList = await Product.find();
    console.log("\n📦 Available Products in Database:");
    if (productsList.length === 0) {
      console.log("⚠️ No products found in the database. Seeding will likely fail to link products.");
    } else {
      productsList.forEach(p => console.log(`- ${p.name} (Slug: ${p.slug})`));
    }
    console.log("");

    // 3. Read JSON data
    if (!fs.existsSync(JSON_PATH)) {
      throw new Error(`JSON seed file not found at: ${JSON_PATH}`);
    }
    const rawData = fs.readFileSync(JSON_PATH, 'utf8');
    const recipesToSeed = JSON.parse(rawData);

    let insertedCount = 0;
    let skippedCount = 0;
    let missingProductsCount = 0;

    for (const recipeData of recipesToSeed) {
      // A. Duplicate Protection
      const existingRecipe = await Recipe.findOne({ slug: recipeData.slug });
      if (existingRecipe) {
        console.log(`⏭️  Skipped (already exists): ${recipeData.title}`);
        skippedCount++;
        continue;
      }

      // B. Product Matching (Slug First)
      let product = await Product.findOne({ slug: recipeData.productSlug });

      // C. Fallback Case-Insensitive Name Match
      if (!product) {
        product = await Product.findOne({
          name: { $regex: recipeData.productSlug, $options: "i" }
        });
      }

      // D. If Product Still Not Found
      if (!product) {
        console.log(`❌ Skipped (product connection not found): ${recipeData.title} -> Missing Product: [${recipeData.productSlug}]`);
        missingProductsCount++;
        skippedCount++;
        continue;
      }

      // E. Insert Recipe Properly Linked
      const newRecipe = new Recipe({
        ...recipeData,
        products: [product._id],
        status: recipeData.status || 'published'
      });

      await newRecipe.save();
      console.log(`✅ Inserted: ${recipeData.title} (Linked to: ${product.name})`);
      insertedCount++;
    }

    // F. Final Summary
    console.log('\n📊 Seeding Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Records:    ${recipesToSeed.length}`);
    console.log(`Inserted:         ${insertedCount}`);
    console.log(`Skipped:          ${skippedCount}`);
    console.log(`Missing Products: ${missingProductsCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('💥 Fatal Seeding Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 DB Connection Closed');
  }
}

seedRecipes();
