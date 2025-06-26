import {
  formatDisplayDate,
  // Import but rename to avoid ESLint warnings about unused imports
  formatDisplayDateTime as _formatDisplayDateTime,
  formatISODate as _formatISODate,
  formatRSSDate as _formatRSSDate,
  formatDatabaseDate as _formatDatabaseDate,
  isPastDate as _isPastDate,
  isFutureDate as _isFutureDate,
  getDaysAgo as _getDaysAgo,
  getDaysFromNow as _getDaysFromNow,
  daysBetween as _daysBetween,
  isArchived as _isArchived,
  validateDate as _validateDate,
  getSafeDateString,
  parseDateSafe
} from '../date-utils';

describe('Date Utilities', () => {
  // Mock the console methods to prevent test output pollution
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  beforeEach(() => {
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  describe('formatDisplayDate', () => {
    it('should format a valid date correctly', () => {
      const date = new Date('2023-05-15T12:00:00Z');
      expect(formatDisplayDate(date)).toMatch(/May 15, 2023/);
    });

    it('should handle string dates', () => {
      expect(formatDisplayDate('2023-05-15T12:00:00Z')).toMatch(/May 15, 2023/);
    });

    it('should return "Unknown date" for invalid dates', () => {
      expect(formatDisplayDate('invalid-date')).toBe('Unknown date');
    });

    it('should handle null or undefined', () => {
      expect(formatDisplayDate(null as any)).toBe('Unknown date');
      expect(formatDisplayDate(undefined as any)).toBe('Unknown date');
    });
  });

  describe('getSafeDateString', () => {
    it('should return a valid ISO string for valid dates', () => {
      const date = new Date('2023-05-15T12:00:00Z');
      expect(getSafeDateString(date)).toBe(date.toISOString());
    });

    it('should handle string dates', () => {
      const dateStr = '2023-05-15T12:00:00Z';
      const expected = new Date(dateStr).toISOString();
      expect(getSafeDateString(dateStr)).toBe(expected);
    });

    it('should preserve future dates by default', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = getSafeDateString(futureDate);

      // The result should be the future date
      expect(result).toBe(futureDate.toISOString());
    });

    it('should return current date for future dates when preserveFutureDates is false', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = getSafeDateString(futureDate, false, false);
      const now = new Date();

      // The result should be close to now (within a few seconds)
      const resultDate = new Date(result);
      expect(Math.abs(resultDate.getTime() - now.getTime())).toBeLessThan(5000);
    });

    it('should return current date for invalid dates', () => {
      const result = getSafeDateString('invalid-date');
      const now = new Date();

      // The result should be close to now (within a few seconds)
      const resultDate = new Date(result);
      expect(Math.abs(resultDate.getTime() - now.getTime())).toBeLessThan(5000);
    });

    it('should handle null or undefined', () => {
      const result1 = getSafeDateString(undefined);
      const result2 = getSafeDateString(null as any);
      const now = new Date();

      // The results should be close to now (within a few seconds)
      const resultDate1 = new Date(result1);
      const resultDate2 = new Date(result2);
      expect(Math.abs(resultDate1.getTime() - now.getTime())).toBeLessThan(5000);
      expect(Math.abs(resultDate2.getTime() - now.getTime())).toBeLessThan(5000);
    });
  });

  describe('parseDateSafe', () => {
    it('should parse valid date strings', () => {
      const dateStr = '2023-05-15T12:00:00Z';
      const expected = new Date(dateStr);
      const result = parseDateSafe(dateStr);
      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe(expected.toISOString());
    });

    it('should handle different date formats', () => {
      // ISO format
      expect(parseDateSafe('2023-05-15')).toBeInstanceOf(Date);

      // DD/MM/YYYY format
      const dmyResult = parseDateSafe('15/05/2023');
      expect(dmyResult).toBeInstanceOf(Date);
      if (dmyResult) {
        expect(dmyResult.getFullYear()).toBe(2023);
        expect(dmyResult.getMonth()).toBe(4); // May is 4 (zero-based)
        expect(dmyResult.getDate()).toBe(15);
      }

      // MM/DD/YYYY format
      const mdyResult = parseDateSafe('05/15/2023');
      expect(mdyResult).toBeInstanceOf(Date);
      if (mdyResult) {
        expect(mdyResult.getFullYear()).toBe(2023);
        expect(mdyResult.getMonth()).toBe(4); // May is 4 (zero-based)
        expect(mdyResult.getDate()).toBe(15);
      }
    });

    it('should return null for invalid dates', () => {
      expect(parseDateSafe('invalid-date')).toBeNull();
    });

    it('should handle null or undefined', () => {
      expect(parseDateSafe(undefined)).toBeNull();
      expect(parseDateSafe(null as any)).toBeNull();
    });
  });

  // Add more tests for other functions as needed
});
