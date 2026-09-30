import express from 'express';
import { createReview, getHistory, getReviewById } from '../controllers/reviewController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.post('/review', optionalProtect, createReview);
router.get('/history', optionalProtect, getHistory);
router.get('/review/:id', getReviewById);

export default router;
