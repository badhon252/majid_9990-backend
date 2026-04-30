import axios from 'axios';
import AppError from '../../errors/AppError';
import { IBarcodeSearchResult, IEANSearchAPIResponse, ICacheEntry } from './barcode.interface';

// In-memory cache Map
const barcodeCache = new Map<string, ICacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

const EAN_SEARCH_API = 'https://www.ean-search.org/api/';
const EAN_AUTH_TOKEN = process.env.EAN_SEARCH_TOKEN || 'd2890af90c79c45cc9b0c9caab16337d7a66fc07';

/**
 * Check if cache entry is still valid
 */
const isCacheValid = (timestamp: number): boolean => {
      return Date.now() - timestamp < CACHE_TTL;
};

/**
 * Format API response to match our standard
 */
const formatBarcodeResult = (product: any, barcode: string): IBarcodeSearchResult => {
      return {
            name: product?.name || 'Unknown Product',
            brand: product?.brand || product?.manufacturer || undefined,
            category: product?.category || undefined,
            description: product?.description || undefined,
            barcode: barcode,
            image: product?.image || undefined,
            rawData: product,
      };
};

/**
 * Call EAN-Search API for barcode lookup
 */
const callEANSearchAPI = async (cleanCode: string): Promise<IBarcodeSearchResult> => {
      const response = await axios.get<IEANSearchAPIResponse>(
            `${EAN_SEARCH_API}?barcode=${cleanCode}&token=${EAN_AUTH_TOKEN}`,
            {
                  timeout: 10000,
            }
      );

      if (response.data?.status === 0 && response.data?.product) {
            return formatBarcodeResult(response.data.product, cleanCode);
      } else if (response.data?.status !== 0) {
            throw new Error(response.data?.message || 'Product not found in database');
      }

      throw new Error('Invalid API response');
};

/**
 * Perform barcode search with retry attempts
 */
const performBarcodeSearchWithRetry = async (cleanCode: string): Promise<IBarcodeSearchResult> => {
      let lastError: any = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                  console.log(`[Barcode Search] Attempt ${attempt}/${MAX_RETRIES} for code: ${cleanCode}`);
                  const result = await callEANSearchAPI(cleanCode);
                  console.log(`[Barcode Found] ${cleanCode} via MCP API`);
                  return result;
            } catch (error: any) {
                  lastError = error;
                  console.warn(`[MCP API Failed] Attempt ${attempt}: ${error.message}`);

                  if (attempt < MAX_RETRIES) {
                        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                  }
            }
      }

      throw lastError || new Error('API search failed');
};

/**
 * Search product by barcode via EAN-Search MCP API
 * Includes retry logic and caching
 */
const searchByBarcode = async (code: string): Promise<IBarcodeSearchResult> => {
      // Validate barcode
      if (!code || code.trim().length === 0) {
            throw new AppError('Barcode code is required', 400);
      }

      const cleanCode = code.trim();
      const cacheKey = `barcode_${cleanCode}`;

      // Check cache first
      const cachedEntry = barcodeCache.get(cacheKey);
      if (cachedEntry && isCacheValid(cachedEntry.timestamp)) {
            console.log(`[Barcode Cache Hit] ${cleanCode}`);
            return cachedEntry.data;
      }

      // Search with retries
      const result = await performBarcodeSearchWithRetry(cleanCode);

      // Cache the result
      barcodeCache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
      });

      return result;
};

/**
 * Call EAN-Search API for name-based search
 */
const callEANSearchNameAPI = async (cleanQuery: string): Promise<IBarcodeSearchResult[]> => {
      const response = await axios.get<any>(
            `${EAN_SEARCH_API}?name=${encodeURIComponent(cleanQuery)}&token=${EAN_AUTH_TOKEN}`,
            {
                  timeout: 10000,
            }
      );

      if (response.data?.products && Array.isArray(response.data.products)) {
            return response.data.products.map((product: any) =>
                  formatBarcodeResult(product, product?.ean || product?.barcode || 'N/A')
            );
      }

      throw new Error('No products found');
};

/**
 * Perform name search with retry attempts
 */
const performNameSearchWithRetry = async (cleanQuery: string): Promise<IBarcodeSearchResult[]> => {
      let lastError: any = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                  console.log(`[Name Search] Attempt ${attempt}/${MAX_RETRIES} for query: ${cleanQuery}`);
                  const results = await callEANSearchNameAPI(cleanQuery);
                  console.log(`[Name Search Found] ${results.length} results for: ${cleanQuery}`);
                  return results;
            } catch (error: any) {
                  lastError = error;

                  if (attempt < MAX_RETRIES) {
                        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                  }
            }
      }

      throw lastError || new Error('Name search failed');
};

/**
 * Search product by name keyword
 * Includes retry logic
 */
const searchByName = async (query: string): Promise<IBarcodeSearchResult[]> => {
      // Validate query
      if (!query || query.trim().length === 0) {
            throw new AppError('Search query is required', 400);
      }

      if (query.trim().length < 2) {
            throw new AppError('Search query must be at least 2 characters', 400);
      }

      const cleanQuery = query.trim();
      const cacheKey = `name_${cleanQuery.toLowerCase()}`;

      // Check cache first
      const cachedEntry = barcodeCache.get(cacheKey);
      if (cachedEntry && isCacheValid(cachedEntry.timestamp)) {
            console.log(`[Name Search Cache Hit] ${cleanQuery}`);
            return [cachedEntry.data];
      }

      // Search with retries
      const results = await performNameSearchWithRetry(cleanQuery);

      // Cache the first result
      if (results.length > 0) {
            barcodeCache.set(cacheKey, {
                  data: results[0],
                  timestamp: Date.now(),
            });
      }

      return results;
};

/**
 * Fallback REST-based search (in case MCP fails)
 * Uses external barcode database API as backup
 */
const fallbackRestSearch = async (code: string): Promise<IBarcodeSearchResult> => {
      try {
            console.log(`[Fallback REST] Searching for barcode: ${code}`);

            // Using a public barcode lookup service as fallback
            const response = await axios.get(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`, {
                  timeout: 10000,
            });

            if (response.data?.items && response.data.items.length > 0) {
                  const item = response.data.items[0];
                  const result = formatBarcodeResult(
                        {
                              name: item.title,
                              brand: item.brand,
                              category: item.category,
                              description: item.description,
                              image: item.image,
                        },
                        code
                  );

                  console.log(`[Fallback REST Success] Found product: ${item.title}`);
                  return result;
            } else {
                  throw new Error('No data from fallback API');
            }
      } catch (error: any) {
            console.error(`[Fallback REST Failed] ${error.message}`);
            throw new AppError('Barcode not found in any database', 404);
      }
};

/**
 * Clear cache for testing purposes
 */
const clearCache = (): void => {
      barcodeCache.clear();
      console.log('[Cache] Cleared all barcode cache');
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
      return {
            size: barcodeCache.size,
            ttl: CACHE_TTL,
            entries: Array.from(barcodeCache.entries()).map(([key, value]) => ({
                  key,
                  age: Date.now() - value.timestamp,
            })),
      };
};

export default {
      searchByBarcode,
      searchByName,
      fallbackRestSearch,
      clearCache,
      getCacheStats,
};
