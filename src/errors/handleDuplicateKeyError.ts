import { TErrorSources, TGenericErrorResponse } from '../interface/error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleDuplicateError = (err: any): TGenericErrorResponse => {
      const keyValue = err?.keyValue ?? {};
      const entries = Object.entries(keyValue);
      const errorSources: TErrorSources = entries.length
            ? entries.map(([path, value]) => ({
                    path,
                    message: `${value} already exists`,
              }))
            : [
                    {
                          path: '',
                          message: 'Duplicate value already exists',
                    },
              ];

      const statusCode = 409;

      return {
            statusCode,
            message: 'Duplicate entry',
            errorSources,
      };
};

export default handleDuplicateError;
