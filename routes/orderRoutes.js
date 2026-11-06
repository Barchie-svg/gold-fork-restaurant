const express = require('express');
const router = express.Router();
const {
  createOrder, getOrders, getOrder, updateOrderStatus, getOrderStats,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// IMPORTANT: /stats must be before /:id
router.get('/stats', protect, getOrderStats);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/', createOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
