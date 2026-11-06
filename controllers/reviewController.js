const Review = require('../models/Review');

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Public
 */
const createReview = async (req, res, next) => {
  try {
    const { customerName, rating, comment } = req.body;

    if (!customerName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Name, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.create({ customerName, rating, comment });

    res.status(201).json({
      success: true,
      message: 'Review submitted! It will appear after approval.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all approved reviews
 * @route   GET /api/reviews/approved
 * @access  Public
 */
const getApprovedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews (admin)
 * @route   GET /api/reviews
 * @access  Private
 */
const getAllReviews = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.approved !== undefined) {
      filter.approved = req.query.approved === 'true';
    }
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve or reject a review
 * @route   PUT /api/reviews/:id
 * @access  Private (admin)
 */
const updateReviewStatus = async (req, res, next) => {
  try {
    const { approved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true, runValidators: true }
    );
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (admin)
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getApprovedReviews, getAllReviews, updateReviewStatus, deleteReview };
