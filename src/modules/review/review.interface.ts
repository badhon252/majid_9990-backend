import { Model, Types } from 'mongoose';

export interface IReview {
      rating: number;
      description?: string;
      userId: Types.ObjectId;
      repairRequestId: Types.ObjectId;
      shopkeeperId: Types.ObjectId;
}

export interface reviewModel extends Model<IReview> {}
