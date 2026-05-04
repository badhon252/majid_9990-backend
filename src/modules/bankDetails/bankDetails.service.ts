import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { IBankDetail } from './bankDetails.interface';
import { BankDetail } from './bankDetails.model';

const createBankDetail = async (payload: Partial<IBankDetail>, userId: string) => {
      const exists = await BankDetail.findOne({ invoiceId: payload.invoiceId });

      if (exists) {
            throw new AppError('Bank details already exist for this invoice', StatusCodes.CONFLICT);
      }

      const result = await BankDetail.create({
            ...payload,
            addedBy: userId,
      });

      return result;
};

const updateBankDetail = async (id: string, payload: Partial<IBankDetail>, userId: string) => {
      const existing = await BankDetail.findOne({ _id: id, addedBy: userId });

      if (!existing) {
            throw new AppError('Bank details not found', StatusCodes.NOT_FOUND);
      }

      return await BankDetail.findOneAndUpdate({ _id: id, addedBy: userId }, payload, {
            new: true,
            runValidators: true,
      });
};

const deleteBankDetail = async (id: string, userId: string) => {
      const existing = await BankDetail.findOne({ _id: id, addedBy: userId });

      if (!existing) {
            throw new AppError('Bank details not found', StatusCodes.NOT_FOUND);
      }

      await BankDetail.findOneAndDelete({ _id: id, addedBy: userId });

      return null;
};

const getByInvoiceId = async (invoiceId: string) => {
      const result = await BankDetail.findOne({ invoiceId }).populate('addedBy', 'firstName lastName email');

      if (!result) {
            throw new AppError('Bank details not found for this invoice', StatusCodes.NOT_FOUND);
      }

      return result;
};

const getByAddedBy = async (addedBy: string) => {
      return await BankDetail.find({ addedBy }).sort({ createdAt: -1 });
};

const bankDetailService = {
      createBankDetail,
      updateBankDetail,
      deleteBankDetail,
      getByInvoiceId,
      getByAddedBy,
};

export default bankDetailService;
