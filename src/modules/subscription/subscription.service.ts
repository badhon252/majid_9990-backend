import { ISubscription } from './subscription.interface';
import Subscription from './subscription.model';

const createSubscription = async (payload: ISubscription) => {
      const totalSubscriptions = await Subscription.countDocuments();
      if (totalSubscriptions >= 3) {
            throw new Error('You can create only 3 subscriptions');
      }

      if (!payload.title) {
            throw new Error('Title is required');
      }

      if (!payload.billingModel) {
            throw new Error('Billing model is required');
      }

      // 2️⃣ Duplicate check
      const isExist = await Subscription.findOne({ title: payload.title });
      if (isExist) {
            throw new Error('Subscription with this title already exists');
      }

      // 3️⃣ FREE plan logic
      if (payload.billingModel === 'free') {
            payload.price.amount = 0;
            payload.isFree = true;
      }

      // 4️⃣ ENTERPRISE plan (NO PRICE REQUIRED)
      const isEnterprise = payload.billingModel === 'subscription';

      if (!isEnterprise) {
            if (!payload.price || !payload.price.currency) {
                  throw new Error('Price and currency are required');
            }

            const { amount, min, max } = payload.price;

            // conflict check
            if (amount !== undefined && (min !== undefined || max !== undefined)) {
                  throw new Error('Use either amount OR min/max, not both');
            }

            // required check
            if (amount === undefined && (min === undefined || max === undefined)) {
                  throw new Error('Provide either fixed amount or min & max range');
            }
      }

      // 5️⃣ Default discount
      if (!payload.discount) {
            payload.discount = [];
      }

      // 6️⃣ Create subscription
      const result = await Subscription.create(payload);
      return result;
};

const subscriptionService = {
      createSubscription,
};

export default subscriptionService;
