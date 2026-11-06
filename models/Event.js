const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['Birthday', 'Wedding', 'Corporate', 'Private Dining', 'Catering', 'Other'],
      required: [true, 'Event type is required'],
    },
    eventDate: {
      type: Date,
    },
    guestCount: {
      type: Number,
      min: [1, 'At least 1 guest is required'],
    },
    venue: {
      type: String,
      enum: ['Indoor', 'Outdoor', 'Both'],
    },
    budget: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', EventSchema);
