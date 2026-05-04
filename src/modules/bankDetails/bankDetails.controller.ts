import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import bankDetailService from './bankDetails.service';

const createBankDetail = catchAsync(async (req, res) => {
      const userId = req.user._id as string;
      const result = await bankDetailService.createBankDetail(req.body, userId);

      sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            message: 'Bank details created successfully',
            data: result,
      });
});

const updateBankDetail = catchAsync(async (req, res) => {
      const userId = req.user._id as string;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const result = await bankDetailService.updateBankDetail(id, req.body, userId);

      sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Bank details updated successfully',
            data: result,
      });
});

const deleteBankDetail = catchAsync(async (req, res) => {
      const userId = req.user._id as string;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      await bankDetailService.deleteBankDetail(id, userId);

      sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Bank details deleted successfully',
            data: null,
      });
});

const getByInvoiceId = catchAsync(async (req, res) => {
      const invoiceId = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;
      const result = await bankDetailService.getByInvoiceId(invoiceId);

      sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Bank details fetched successfully',
            data: result,
      });
});

const getByAddedBy = catchAsync(async (req, res) => {
      const addedBy = Array.isArray(req.params.addedBy) ? req.params.addedBy[0] : req.params.addedBy;
      const result = await bankDetailService.getByAddedBy(addedBy);

      sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: 'Bank details list fetched successfully',
            data: result,
      });
});

const bankDetailController = {
      createBankDetail,
      updateBankDetail,
      deleteBankDetail,
      getByInvoiceId,
      getByAddedBy,
};

export default bankDetailController;
