import { Router } from 'express';
import { checkImeiFromDhru, getServices } from './dhru.controller';
import { getDeviceAnalysis, getRiskAnalysis } from './riskAnalysis.controller';

const router = Router();

router.post('/check', checkImeiFromDhru);
router.post('/risk-analysis', getRiskAnalysis);
router.post('/device-analysis', getDeviceAnalysis);

// temporary api just to check
router.get('/services', getServices);

export default router;
