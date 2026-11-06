const fs = require('fs');
const path = require('path');
const MenuItem = require('../models/MenuItem');

/**
 * Helper — delete an image file from uploads/
 */
const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  // imagePath stored as "uploads/filename.jpg" or "/uploads/filename.jpg"
  const relativePart = imagePath.replace(/^\//, '');
  const fullPath = path.join(__dirname, '..', relativePart);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error('Could not delete image file:', err.message);
    }
  }
};

/**
 * @desc    Get all menu items (optionally filtered by category)
 * @route   GET /api/menu?category=Starters
 * @access  Public
 */
const getMenuItems = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.available !== undefined) {
      filter.available = req.query.available === 'true';
    }

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get featured menu items
 * @route   GET /api/menu/featured
 * @access  Public
 */
const getFeaturedItems = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ featured: true, available: true }).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single menu item
 * @route   GET /api/menu/:id
 * @access  Public
 */
const getMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a menu item
 * @route   POST /api/menu
 * @access  Private (admin)
 */
const createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, available, featured } = req.body;

    const imageUrl = req.file ? `uploads/${req.file.filename}` : '';

    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      image: imageUrl,
      available: available !== undefined ? available : true,
      featured: featured !== undefined ? featured : false,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a menu item
 * @route   PUT /api/menu/:id
 * @access  Private (admin)
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      // Clean up newly uploaded file if item not found
      if (req.file) deleteImageFile(`uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    const { name, description, price, category, available, featured } = req.body;

    // Handle image replacement
    if (req.file) {
      // Delete old image if it exists
      if (item.image) deleteImageFile(item.image);
      item.image = `uploads/${req.file.filename}`;
    }

    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (category !== undefined) item.category = category;
    if (available !== undefined) item.available = available;
    if (featured !== undefined) item.featured = featured;

    const updatedItem = await item.save();

    res.status(200).json({ success: true, data: updatedItem });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a menu item
 * @route   DELETE /api/menu/:id
 * @access  Private (admin)
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Delete associated image file
    if (item.image) deleteImageFile(item.image);

    await item.deleteOne();

    res.status(200).json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getFeaturedItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
