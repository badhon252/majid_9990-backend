import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import reviewController from './review.controller';

const router = Router();

router.post('/create', protect, reviewController.createReview);

router.get('/shopkeeper/:shopkeeperId', reviewController.getReviewsByShopkeeper);
router.delete('/:reviewId', protect, reviewController.deleteReview);

export default router;
