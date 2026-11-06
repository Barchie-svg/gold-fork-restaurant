require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Review = require('./models/Review');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};

const menuItems = [
  // ── Starters ──────────────────────────────────────────
  { name: 'Soup of the Day', description: 'Chef\'s daily selection of fresh, hand-crafted soup served with artisan bread. Rich, hearty, and warming.', price: 450, category: 'Starters', available: true, featured: false },
  { name: 'Crispy Chicken Wings', description: 'Golden-fried chicken wings tossed in our signature spicy-honey glaze, served with blue cheese dip.', price: 850, category: 'Starters', available: true, featured: true },
  { name: 'Bruschetta al Pomodoro', description: 'Toasted sourdough bread topped with fresh tomatoes, basil, garlic, and a drizzle of extra-virgin olive oil.', price: 650, category: 'Starters', available: true, featured: false },
  { name: 'Crispy Calamari', description: 'Tender calamari rings lightly dusted in seasoned flour, flash-fried and served with marinara sauce and lemon.', price: 950, category: 'Starters', available: true, featured: false },
  // ── Mains ─────────────────────────────────────────────
  { name: 'Grilled Ribeye Steak', description: '300g premium beef ribeye, grilled to your preferred doneness, served with roasted vegetables and truffle butter.', price: 2800, category: 'Mains', available: true, featured: true },
  { name: 'Butter Chicken Curry', description: 'Tender chicken in a rich, creamy tomato-butter sauce infused with aromatic spices, served with basmati rice and naan.', price: 1400, category: 'Mains', available: true, featured: false },
  { name: 'Grilled Nile Perch', description: 'Fresh Nile perch fillet seasoned with lemon-herb marinade, grilled to perfection, served with sautéed greens and ugali.', price: 1800, category: 'Mains', available: true, featured: false },
  { name: 'Lamb Chops', description: 'Herb-marinated New Zealand lamb chops, grilled over an open flame, served with rosemary jus and mashed potato.', price: 2400, category: 'Mains', available: true, featured: false },
  { name: 'Pasta Carbonara', description: 'Al dente spaghetti tossed in a silky sauce of eggs, pecorino romano, pancetta, and cracked black pepper.', price: 1200, category: 'Mains', available: true, featured: false },
  { name: 'Gourmet Beef Burger', description: 'Double smash-patty burger with aged cheddar, caramelized onions, pickles, and house sauce in a brioche bun.', price: 1100, category: 'Mains', available: true, featured: true },
  // ── Desserts ──────────────────────────────────────────
  { name: 'Chocolate Lava Cake', description: 'Warm, decadent dark chocolate fondant with a molten centre, served with vanilla bean ice cream and berry coulis.', price: 650, category: 'Desserts', available: true, featured: false },
  { name: 'Mango Cheesecake', description: 'Velvety creamy cheesecake on a buttery biscuit base, topped with a vibrant fresh mango compote.', price: 550, category: 'Desserts', available: true, featured: false },
  { name: 'Ice Cream Sundae', description: 'Three scoops of premium gelato with hot fudge, whipped cream, roasted nuts, and a maraschino cherry.', price: 450, category: 'Desserts', available: true, featured: false },
  // ── Drinks ────────────────────────────────────────────
  { name: 'Fresh Pressed Juice', description: 'Seasonal selection of freshly pressed fruits — orange, watermelon, passion fruit, or pineapple.', price: 350, category: 'Drinks', available: true, featured: false },
  { name: 'Tropical Mango Smoothie', description: 'Blended ripe mangoes with yogurt, honey, and a hint of ginger. Thick, creamy, and refreshing.', price: 450, category: 'Drinks', available: true, featured: false },
  { name: 'Craft Beer', description: 'Rotating selection of locally brewed craft beers. Ask your server for today\'s options.', price: 600, category: 'Drinks', available: true, featured: false },
  { name: 'House Wine', description: 'Carefully selected red or white wine from our curated cellar. Available by the glass or bottle.', price: 800, category: 'Drinks', available: true, featured: false },
  // ── Specials ──────────────────────────────────────────
  { name: "Chef's Special Platter", description: 'An impressive sharing board curated daily by our Executive Chef — featuring the finest seasonal ingredients and house signatures.', price: 3500, category: 'Specials', available: true, featured: true },
  { name: 'Sunday Roast', description: 'Traditional slow-roasted beef served with crispy roast potatoes, Yorkshire pudding, seasonal vegetables, and rich gravy.', price: 2200, category: 'Specials', available: true, featured: true },
  { name: 'Seafood Feast', description: 'A lavish spread of tiger prawns, grilled lobster tail, calamari, and mussels served with garlic bread and aioli.', price: 3200, category: 'Specials', available: true, featured: true },
];

const reviews = [
  { customerName: 'James Mwangi', rating: 5, comment: 'Absolutely outstanding! The ribeye steak was cooked to perfection. Best dining experience in Nairobi — will definitely be back!', approved: true },
  { customerName: 'Amina Hassan', rating: 5, comment: 'The ambiance is incredible and the food is even better. Every dish was a masterpiece. Best restaurant in Nairobi!', approved: true },
  { customerName: 'Peter Ochieng', rating: 4, comment: 'Great food and excellent service. The butter chicken curry was divine. Highly recommended for a special evening out.', approved: true },
  { customerName: 'Grace Wanjiku', rating: 5, comment: 'Celebrated my birthday here and it was magical. The team went above and beyond to make it special. 10/10!', approved: true },
  { customerName: 'David Kamau', rating: 4, comment: 'Fantastic dining experience. The seafood platter was incredibly fresh and the presentation was beautiful.', approved: true },
];

const seed = async () => {
  try {
    await connectDB();

    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Review.deleteMany({});

    console.log('👤  Creating admin user...');
    await User.create({
      name: process.env.ADMIN_NAME || 'Restaurant Admin',
      email: process.env.ADMIN_EMAIL || 'admin@goldenfork.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role: 'admin',
    });
    console.log('   ✅ Admin created: admin@goldenfork.com / Admin@1234');

    console.log('🍽️  Seeding menu items...');
    await MenuItem.insertMany(menuItems);
    console.log(`   ✅ ${menuItems.length} menu items created`);

    console.log('⭐  Seeding reviews...');
    await Review.insertMany(reviews);
    console.log(`   ✅ ${reviews.length} reviews created`);

    console.log('\n🎉  Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌  Seed error:', error.message);
    process.exit(1);
  }
};

seed();
