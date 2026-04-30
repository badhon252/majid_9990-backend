# Barcode API - Quick Reference & Examples

## 🎯 Common Barcode Formats

| Format  | Length     | Example        | Use Case                 |
| ------- | ---------- | -------------- | ------------------------ |
| EAN-13  | 13 digits  | 5901234123457  | Retail products globally |
| UPC-A   | 12 digits  | 012000008449   | North American products  |
| UPC-E   | 6-8 digits | 0120000        | Compressed UPC           |
| GTIN-14 | 14 digits  | 10614141000418 | Logistics/pallets        |
| ISBN-10 | 10 digits  | 0451524934     | Books                    |
| ISBN-13 | 13 digits  | 9780451524935  | Books (modern)           |

## 🔍 Real-World Test Barcodes

Try these with your API:

```bash
# Coca-Cola 1.5L
GET /api/v1/barcode/5901234123457

# Coca-Cola 330ml can
GET /api/v1/barcode/5449000050127

# Nintendo Wii Console
GET /api/v1/barcode/045496900219

# The Great Gatsby (Book)
GET /api/v1/barcode/9780451524935

# iPhone 13 (US)
GET /api/v1/barcode/194253232882
```

## 📋 Response Examples

### ✅ Successful Barcode Search

```json
{
      "statusCode": 200,
      "success": true,
      "message": "Product found successfully",
      "data": {
            "name": "Coca-Cola 1.5L PET",
            "brand": "The Coca-Cola Company",
            "category": "Beverages",
            "description": "Coca-Cola Classic 1.5 liters in plastic bottle",
            "barcode": "5901234123457",
            "image": "https://images.ean-search.org/images/1-5901234123457.jpg",
            "rawData": {
                  "ean": "5901234123457",
                  "name": "Coca-Cola 1.5L PET",
                  "brand": "The Coca-Cola Company",
                  "category": "Beverages",
                  "description": "Coca-Cola Classic 1.5 liters in plastic bottle",
                  "image": "https://images.ean-search.org/images/1-5901234123457.jpg"
            }
      }
}
```

### ✅ Successful Name Search

```json
{
      "statusCode": 200,
      "success": true,
      "message": "Found 5 product(s)",
      "data": [
            {
                  "name": "Coca-Cola Zero Sugar 330ml",
                  "brand": "The Coca-Cola Company",
                  "category": "Beverages",
                  "barcode": "5449000050110",
                  "image": "https://images.ean-search.org/images/1-5449000050110.jpg",
                  "rawData": {
                        /* ... */
                  }
            },
            {
                  "name": "Coca-Cola Classic 500ml",
                  "brand": "The Coca-Cola Company",
                  "category": "Beverages",
                  "barcode": "5449000134419",
                  "image": "https://images.ean-search.org/images/1-5449000134419.jpg",
                  "rawData": {
                        /* ... */
                  }
            }
            // ... more products
      ]
}
```

### ❌ Product Not Found

```json
{
      "statusCode": 404,
      "success": false,
      "message": "Product with barcode 9999999999999 not found"
}
```

### ❌ Missing Query Parameter

```json
{
      "statusCode": 400,
      "success": false,
      "message": "Search query is required"
}
```

### ❌ Query Too Short

```json
{
      "statusCode": 400,
      "success": false,
      "message": "Search query must be at least 2 characters"
}
```

## 🌐 API Request Examples

### JavaScript/Fetch

```typescript
// Search by barcode
async function searchBarcode(code: string) {
      try {
            const response = await fetch(`/api/v1/barcode/${code}`);
            const data = await response.json();

            if (data.success) {
                  console.log('Product:', data.data);
                  return data.data;
            } else {
                  console.error('Not found:', data.message);
            }
      } catch (error) {
            console.error('Error:', error);
      }
}

// Search by name
async function searchByName(query: string) {
      try {
            const response = await fetch(`/api/v1/barcode/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data.success) {
                  console.log(`Found ${data.data.length} products`);
                  return data.data;
            } else {
                  console.error('Search failed:', data.message);
            }
      } catch (error) {
            console.error('Error:', error);
      }
}

// Usage
searchBarcode('5901234123457');
searchByName('Coca-Cola');
```

### Python/Requests

```python
import requests

# Search by barcode
response = requests.get('http://localhost:5000/api/v1/barcode/5901234123457')
data = response.json()
if data['success']:
    print(data['data'])

# Search by name
response = requests.get(
    'http://localhost:5000/api/v1/barcode/search',
    params={'query': 'Coca-Cola'}
)
data = response.json()
print(f"Found {len(data['data'])} products")
```

### cURL Commands

```bash
# Simple barcode search
curl http://localhost:5000/api/v1/barcode/5901234123457

# Pretty print response
curl http://localhost:5000/api/v1/barcode/5901234123457 | jq

# Name search with URL encoding
curl "http://localhost:5000/api/v1/barcode/search?query=Coca%20Cola"

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/barcode/stats/cache

# Save response to file
curl http://localhost:5000/api/v1/barcode/5901234123457 > product.json

# Show response headers
curl -i http://localhost:5000/api/v1/barcode/5901234123457
```

## 🧠 Cache Behavior Examples

### Cache Hit Scenario

```
Time: 0s
Request: GET /api/v1/barcode/5901234123457
Status: Cache MISS → API call
Response time: ~200ms
Result: Cached

Time: 30s
Request: GET /api/v1/barcode/5901234123457 (same barcode)
Status: Cache HIT
Response time: ~1ms
Console: "[Barcode Cache Hit] 5901234123457"

Time: 24 hours + 1 min
Request: GET /api/v1/barcode/5901234123457
Status: Cache EXPIRED → API call
Response time: ~200ms
Result: Re-cached
```

### Different Searches Use Different Cache Keys

```
GET /api/v1/barcode/5901234123457
Cache Key: "barcode_5901234123457"

GET /api/v1/barcode/search?query=coca-cola
Cache Key: "name_coca-cola"

These are separate cache entries!
```

## 🔄 Retry Logic Examples

### Retry on Timeout

```
Attempt 1:
  - Send to EAN-Search API
  - Timeout after 10 seconds
  - Wait 1 second

Attempt 2:
  - Send to EAN-Search API
  - Response received within 5 seconds
  - Return result ✓

Total time: ~16 seconds (10s + 1s wait + 5s)
```

### Retry on Network Error

```
Attempt 1:
  - Network connection lost
  - Error: "ECONNREFUSED"
  - Wait 1 second

Attempt 2:
  - Network restored
  - Request successful
  - Return result ✓
```

### Fallback After 2 Failed Retries

```
Attempt 1: Failed (Connection error)
           ↓ Wait 1s
Attempt 2: Failed (Timeout)
           ↓
Return: 404 Not Found

OR if fallback enabled:
           ↓ Try UPCItemDB
Fallback:  Success
           ↓
Return: Product data from fallback API
```

## 📊 Monitoring & Debugging

### Check Cache Status

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/barcode/stats/cache
```

Response:

```json
{
      "statusCode": 200,
      "success": true,
      "message": "Cache statistics retrieved",
      "data": {
            "size": 42,
            "ttl": 86400000,
            "entries": [
                  {
                        "key": "barcode_5901234123457",
                        "age": 3600000
                  },
                  {
                        "key": "name_apple",
                        "age": 7200000
                  }
            ]
      }
}
```

**Interpretation:**

- `size`: 42 items currently cached
- `ttl`: 24 hours (milliseconds)
- `entries[0].age`: First item cached ~1 hour ago
- `entries[1].age`: Second item cached ~2 hours ago

### Server Logs (Development)

```
[Barcode Search] Attempt 1/2 for code: 5901234123457
[Barcode Found] 5901234123457 via MCP API
[Barcode Cache Hit] 5901234123457
[Name Search] Attempt 1/2 for query: apple
[Name Search Found] 3 results for: apple
[Cache] Cleared all barcode cache
```

## ⚠️ Error Scenarios & Fixes

### Scenario 1: Barcode Not in Database

```bash
$ curl http://localhost:5000/api/v1/barcode/0000000000000
```

Response:

```json
{
      "statusCode": 404,
      "success": false,
      "message": "Product with barcode 0000000000000 not found"
}
```

**Fix:**

- Verify barcode is correct
- Check if product is in EAN-Search database
- Try name search instead: `/barcode/search?query=...`
- Use fallback API: `/barcode/fallback/0000000000000`

### Scenario 2: API Token Invalid

```bash
$ curl http://localhost:5000/api/v1/barcode/5901234123457
```

Response after 2 retries:

```json
{
      "statusCode": 404,
      "success": false,
      "message": "Product not found"
}
```

**Fix:**

- Check `EAN_SEARCH_TOKEN` in `.env`
- Verify token hasn't expired
- Generate new token at https://www.ean-search.org/api/
- Restart server

### Scenario 3: Network Issues

```bash
$ curl http://localhost:5000/api/v1/barcode/5901234123457
# Hangs for 10+ seconds, then returns error
```

**Fix:**

- Check internet connection
- Verify firewall allows outbound HTTPS
- Try fallback endpoint: `/barcode/fallback/5901234123457`
- Check EAN-Search API status

### Scenario 4: Query String Issues

```bash
$ curl http://localhost:5000/api/v1/barcode/search?query=a
```

Response:

```json
{
      "statusCode": 400,
      "success": false,
      "message": "Search query must be at least 2 characters"
}
```

**Fix:**

- Minimum 2 characters required
- Try: `?query=ap` or `?query=apple`

## 📱 Integration Examples

### E-Commerce Product Upload

```typescript
// User scans barcode, auto-fill product data
const handleBarcodeScanned = async (barcode: string) => {
      const response = await fetch(`/api/v1/barcode/${barcode}`);
      const { data: product } = await response.json();

      // Auto-fill form
      form.setValue('name', product.name);
      form.setValue('brand', product.brand);
      form.setValue('category', product.category);
      form.setValue('image', product.image);
      form.setValue('description', product.description);
};
```

### Inventory Management System

```typescript
// Check stock for received items
const receiveItem = async (barcode: string, quantity: number) => {
      const product = await fetch(`/api/v1/barcode/${barcode}`).then((r) => r.json());

      await updateInventory({
            productId: product.data.barcode,
            quantity: quantity,
            name: product.data.name,
      });
};
```

### Mobile App Barcode Scanner

```typescript
// React Native example
import { CameraRoll } from '@react-native-community/cameraroll';

const scanBarcode = async (scannedCode: string) => {
      try {
            const response = await fetch(`${API_URL}/barcode/${scannedCode}`);
            const product = await response.json();

            if (product.success) {
                  setProductData(product.data);
            }
      } catch (error) {
            showError('Failed to fetch product');
      }
};
```

---

**Need more help? Check BARCODE_INTEGRATION_GUIDE.md for complete documentation!**
