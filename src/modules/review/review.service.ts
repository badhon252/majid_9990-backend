import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Review } from './review.model';

const createReview = async (payload: any) => {
      const result = await Review.create(payload);
      return result;
};

const getReviewsByShopkeeper = async (shopkeeperId: string) => {
      const result = await Review.find({ shopkeeperId })
            .populate('userId', 'firstName lastName image')
            .populate('repairRequestId');

      return result;
};

const deleteReview = async (reviewId: string, userId: string) => {
      const review = await Review.findById(reviewId);

      if (!review) {
            throw new AppError('Review not found', StatusCodes.NOT_FOUND);
      }

      // Only owner or admin can delete
      if (review.userId.toString() !== userId.toString()) {
            throw new AppError('You are not allowed to delete this review', StatusCodes.FORBIDDEN);
      }

      await Review.findByIdAndDelete(reviewId);

      return null;
};

export default {
      createReview,
      getReviewsByShopkeeper,
      deleteReview,
};
