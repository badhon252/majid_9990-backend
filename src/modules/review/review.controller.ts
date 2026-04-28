import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import reviewService from './review.service';

const createReview = catchAsync(async (req, res) => {
      const userId = req.user._id;

      const payload = {
            ...req.body,
            userId,
      };

      const result = await reviewService.createReview(payload);

      sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Review created successfully',
            data: result,
      });
});

const getReviewsByShopkeeper = catchAsync(async (req, res) => {
      const { shopkeeperId } = req.params;

      const result = await reviewService.getReviewsByShopkeeper(shopkeeperId as string);

      sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Reviews retrieved successfully',
            data: result,
      });
});
const deleteReview = catchAsync(async (req, res) => {
      const { reviewId } = req.params;
      const userId = req.user._id;

      const result = await reviewService.deleteReview(reviewId as string, userId);

      sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Review deleted successfully',
            data: result,
      });
});

export default {
      createReview,
      getReviewsByShopkeeper,
      deleteReview,
};
