import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import subscriptionService from './subscription.service';

const createSubscription = catchAsync(async (req, res) => {
      const result = await subscriptionService.createSubscription(req.body);

      sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Subscription created successfully',
            data: result,
      });
});

const subscriptionController = {
      createSubscription,
};

export default subscriptionController;
