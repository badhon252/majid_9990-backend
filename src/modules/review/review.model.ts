import { Schema, model } from 'mongoose';
import { IReview, reviewModel } from './review.interface';

const reviewSchema = new Schema<IReview>(
      {
            rating: {
                  type: Number,
                  required: true,
                  min: 1,
                  max: 5,
            },
            description: {
                  type: String,
            },
            userId: {
                  type: Schema.Types.ObjectId,
                  ref: 'User',
                  required: true,
            },
            repairRequestId: {
                  type: Schema.Types.ObjectId,
                  ref: 'RepairRequest',
                  required: true,
            },
            shopkeeperId: {
                  type: Schema.Types.ObjectId,
                  ref: 'User',
                  required: true,
            },
      },
      {
            timestamps: true,
            versionKey: false,
      }
);

export const Review = model<IReview, reviewModel>('Review', reviewSchema);
