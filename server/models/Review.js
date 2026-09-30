import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  code: { type: String, required: true },
  language: { type: String, required: true },
  overall_score: { type: Number, required: true },
  review: { type: Object, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
