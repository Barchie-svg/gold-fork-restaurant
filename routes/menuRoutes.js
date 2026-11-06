const express = require('express');
const router = express.Router();
const {
  getMenuItems, getFeaturedItems, getMenuItem,
  createMenuItem, updateMenuItem, deleteMenuItem,
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.get('/featured', getFeaturedItems);
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, uploadSingle, createMenuItem);
router.put('/:id', protect, uploadSingle, updateMenuItem);
router.delete('/:id', protect, deleteMenuItem);

module.exports = router;
