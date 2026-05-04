import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import bankDetailController from './bankDetails.controller';

const router = Router();

router.post('/create', protect, bankDetailController.createBankDetail);
router.put('/update/:id', protect, bankDetailController.updateBankDetail);
router.delete('/delete/:id', protect, bankDetailController.deleteBankDetail);
router.get('/invoice/:invoiceId', protect, bankDetailController.getByInvoiceId);
router.get('/added-by/:addedBy', protect, bankDetailController.getByAddedBy);

export default router;
