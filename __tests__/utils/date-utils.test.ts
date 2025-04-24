import { formatDate, isValidDate, isWithinLast7Days } from '../../app/lib/utils'

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('formats a valid date string correctly', () => {
      expect(formatDate('2024-03-24')).toBe('March 24, 2024')
    })

    it('returns "Invalid Date" for invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date')
    })
  })

  describe('isValidDate', () => {
    it('returns true for valid date strings', () => {
      expect(isValidDate('2024-03-24')).toBe(true)
      expect(isValidDate('2025-12-31')).toBe(true)
    })

    it('returns false for invalid date strings', () => {
      expect(isValidDate('invalid-date')).toBe(false)
      expect(isValidDate('2024-13-45')).toBe(false)
    })
  })

  describe('isWithinLast7Days', () => {
    beforeEach(() => {
      // Mock current date to be 2024-03-24
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2024-03-24'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns true for dates within last 7 days', () => {
      expect(isWithinLast7Days('2024-03-20')).toBe(true)
      expect(isWithinLast7Days('2024-03-18')).toBe(true)
      expect(isWithinLast7Days(new Date('2024-03-20'))).toBe(true)
    })

    it('returns false for dates older than 7 days', () => {
      expect(isWithinLast7Days('2024-03-16')).toBe(false)
      expect(isWithinLast7Days('2024-03-01')).toBe(false)
      expect(isWithinLast7Days(new Date('2024-03-01'))).toBe(false)
    })

    it('returns false for invalid dates', () => {
      expect(isWithinLast7Days('invalid-date')).toBe(false)
    })
  })
}) 