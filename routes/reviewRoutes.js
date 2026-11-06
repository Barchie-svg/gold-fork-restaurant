const express = require('express');
const router = express.Router();
const {
  createReview, getApprovedReviews, getAllReviews, updateReviewStatus, deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/approved', getApprovedReviews);
router.post('/', createReview);
router.get('/', protect, getAllReviews);
router.put('/:id', protect, updateReviewStatus);
router.delete('/:id', protect, deleteReview);

module.exports = router;
