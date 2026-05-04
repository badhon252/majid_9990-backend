# majid_9990-backend

## Device analysis endpoints

The device-check module exposes three public POST routes under the existing API mount points:

- `POST /api/v1/imei/check`
- `POST /api/v1/imei/risk-analysis`
- `POST /api/v1/imei/device-analysis`

The same `device-analysis` route is also available under `/api/v1/device/device-analysis`.

### Combined response

`POST /api/v1/imei/device-analysis` returns a merged payload with both check and risk sections:

```json
{
      "success": true,
      "message": "Device analysis generated",
      "data": {
            "imei": "123456789012345",
            "check": {
                  "serviceId": 6,
                  "provider": "dhru",
                  "structured": {},
                  "providerData": {}
            },
            "risk": {
                  "score": 0,
                  "level": "LOW",
                  "issues": [],
                  "signals": {},
                  "raw": {}
            }
      }
}
```

### Validation

- `imei` is required and must be exactly 15 digits.
- `serviceId` is optional and defaults to the current `DHRU_SERVICE_ID` behavior.
- Existing `/check` and `/risk-analysis` response shapes remain unchanged.


### Bulk Upload inventory from CSV
post /create-from-barcode/bulk
- Details: It accepts a CSV, XLS, or XLSX upload on the file field, reads the first worksheet, maps each row into the same payload shape used by createInventoryFromBarcode, and processes rows one by one. It supports header-based sheets with fields like code or barcode, userId, imeiNumber, purchasePrice, and currentState, and it also falls back to positional columns if there is no header row. The response returns a summary plus per-row success or failure details.
