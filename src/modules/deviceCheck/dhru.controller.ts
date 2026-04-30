import { Request, Response, NextFunction } from 'express';
import { dhruService } from './dhru.service';
import { getExistingScanInfoByImei, isValidImei, resolveServiceId, runImeiCheck } from './deviceCheck.helpers';

export const checkImeiFromDhru = async (req: Request, res: Response, next: NextFunction) => {
      try {
            const imei = String(req.body?.imei ?? '').trim();

            if (!imei || !isValidImei(imei)) {
                  return res.status(400).json({
                        success: false,
                        message: 'Valid 15-digit imei is required',
                  });
            }

            const existingScanInfo = await getExistingScanInfoByImei(imei);

            if (existingScanInfo) {
                  return res.status(200).json({
                        success: true,
                        message: 'IMEI data fetched from database',
                        data: {
                              ...existingScanInfo,
                              oldGenerated: true,
                        },
                  });
            }

            const requestedServiceId = resolveServiceId(req.body?.serviceId);

            if (!Number.isFinite(requestedServiceId) || requestedServiceId <= 0) {
                  return res.status(400).json({
                        success: false,
                        message: 'Valid serviceId is required',
                  });
            }

            const result = await runImeiCheck(String(imei), requestedServiceId);

            if (!result.ok) {
                  return res.status(result.statusCode).json({
                        success: false,
                        message: result.message,
                        data: result.data,
                  });
            }

            return res.status(200).json({
                  success: true,
                  message: `IMEI check completed (${result.provider})`,
                  data: {
                        ...result.structured,
                        providerData: result.providerData,
                        oldGenerated: false,
                  },
            });
      } catch (error) {
            next(error);
      }
};

export const getServices = async (_req: Request, res: Response) => {
      const result = await dhruService.getImeiServices();
      return res.json({
            success: true,
            data: result,
      });
};
