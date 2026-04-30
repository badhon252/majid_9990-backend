import AppError from '../../errors/AppError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { riskAnalysisService } from './riskAnalysis.service';
import { getExistingScanInfoByImei, isValidImei, resolveServiceId, validateServiceId } from './deviceCheck.helpers';

export const getRiskAnalysis = catchAsync(async (req, res) => {
      const imei = String(req.body?.imei ?? '').trim();

      if (!isValidImei(imei)) {
            throw new AppError('Valid 15-digit IMEI is required', 400);
      }

      const existingScanInfo = await getExistingScanInfoByImei(imei);

      if (existingScanInfo) {
            sendResponse(res, {
                  statusCode: 200,
                  success: true,
                  message: 'Risk analysis fetched from database',
                  data: {
                        ...existingScanInfo,
                        oldGenerated: true,
                  },
            });
            return;
      }

      const result = await riskAnalysisService.analyzeRisk(imei);

      sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Risk analysis generated',
            data: {
                  imei,
                  score: result.score,
                  level: result.level,
                  issues: result.issues,
                  signals: result.signals,
                  raw: result.raw,
                  oldGenerated: false,
            },
      });
});

export const getDeviceAnalysis = catchAsync(async (req, res) => {
      const imei = String(req.body?.imei ?? '').trim();

      if (!isValidImei(imei)) {
            return res.status(400).json({
                  success: false,
                  message: 'Valid 15-digit IMEI is required',
            });
      }

      const existingScanInfo = await getExistingScanInfoByImei(imei);

      if (existingScanInfo) {
            sendResponse(res, {
                  statusCode: 200,
                  success: true,
                  message: 'Device analysis fetched from database',
                  data: {
                        ...existingScanInfo,
                        oldGenerated: true,
                  },
            });
            return;
      }

      const serviceId = resolveServiceId(req.body?.serviceId);

      if (!validateServiceId(serviceId)) {
            return res.status(400).json({
                  success: false,
                  message: 'Valid serviceId is required',
            });
      }

      const result = await riskAnalysisService.analyzeDeviceAnalysis(imei, serviceId);

      if (!('risk' in result)) {
            return res.status(result.statusCode).json({
                  success: false,
                  message: result.message,
                  data: result.data,
            });
      }

      sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Device analysis generated',
            data: {
                  ...result,
                  oldGenerated: false,
            },
      });
});
