import { Types } from 'mongoose';

export type TPaymentStatus = 'pending' | 'paid' | 'failed';

export interface IPayment {
      userId: Types.ObjectId;
      subscriptionId?: Types.ObjectId;

      amount: number;
      currency: string;

      stripeSessionId?: string;
      stripePaymentIntentId?: string;

      paymentStatus: TPaymentStatus;

      paymentMethod?: string;

      createdAt?: Date;
      updatedAt?: Date;
}
