import {
  assertNonNullable,
  isNonNullable,
  isString,
  isNumber,
  isBoolean,
  isDate,
  isDateString,
  isArray,
  isObject,
  isFunction,
  isPromise,
  is,
  areAll,
  safeCast,
  safeGet,
} from '../type-utils';

describe('Type Utilities', () => {
  describe('assertNonNullable', () => {
    it('should return the value if it is not null or undefined', () => {
      expect(assertNonNullable('test')).toBe('test');
      expect(assertNonNullable(0)).toBe(0);
      expect(assertNonNullable(false)).toBe(false);
      expect(assertNonNullable({})).toEqual({});
    });
    
    it('should throw an error if the value is null', () => {
      expect(() => assertNonNullable(null)).toThrow('Value is null or undefined');
    });
    
    it('should throw an error if the value is undefined', () => {
      expect(() => assertNonNullable(undefined)).toThrow('Value is null or undefined');
    });
    
    it('should use the provided error message', () => {
      expect(() => assertNonNullable(null, 'Custom error message')).toThrow('Custom error message');
    });
  });
  
  describe('isNonNullable', () => {
    it('should return true if the value is not null or undefined', () => {
      expect(isNonNullable('test')).toBe(true);
      expect(isNonNullable(0)).toBe(true);
      expect(isNonNullable(false)).toBe(true);
      expect(isNonNullable({})).toBe(true);
    });
    
    it('should return false if the value is null', () => {
      expect(isNonNullable(null)).toBe(false);
    });
    
    it('should return false if the value is undefined', () => {
      expect(isNonNullable(undefined)).toBe(false);
    });
  });
  
  describe('isString', () => {
    it('should return true if the value is a string', () => {
      expect(isString('test')).toBe(true);
      expect(isString('')).toBe(true);
    });
    
    it('should return false if the value is not a string', () => {
      expect(isString(123)).toBe(false);
      expect(isString(true)).toBe(false);
      expect(isString({})).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
    });
  });
  
  describe('isNumber', () => {
    it('should return true if the value is a number', () => {
      expect(isNumber(123)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-123)).toBe(true);
      expect(isNumber(123.456)).toBe(true);
    });
    
    it('should return false if the value is NaN', () => {
      expect(isNumber(NaN)).toBe(false);
    });
    
    it('should return false if the value is not a number', () => {
      expect(isNumber('123')).toBe(false);
      expect(isNumber(true)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
    });
  });
  
  describe('isBoolean', () => {
    it('should return true if the value is a boolean', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });
    
    it('should return false if the value is not a boolean', () => {
      expect(isBoolean(123)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean({})).toBe(false);
      expect(isBoolean(null)).toBe(false);
      expect(isBoolean(undefined)).toBe(false);
    });
  });
  
  describe('isDate', () => {
    it('should return true if the value is a valid Date', () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date('2024-03-24'))).toBe(true);
    });
    
    it('should return false if the value is an invalid Date', () => {
      expect(isDate(new Date('invalid'))).toBe(false);
    });
    
    it('should return false if the value is not a Date', () => {
      expect(isDate('2024-03-24')).toBe(false);
      expect(isDate(123)).toBe(false);
      expect(isDate({})).toBe(false);
      expect(isDate(null)).toBe(false);
      expect(isDate(undefined)).toBe(false);
    });
  });
  
  describe('isDateString', () => {
    it('should return true if the value is a valid date string', () => {
      expect(isDateString('2024-03-24')).toBe(true);
      expect(isDateString('2024/03/24')).toBe(true);
      expect(isDateString('March 24, 2024')).toBe(true);
    });
    
    it('should return false if the value is an invalid date string', () => {
      expect(isDateString('invalid')).toBe(false);
    });
    
    it('should return false if the value is not a string', () => {
      expect(isDateString(123)).toBe(false);
      expect(isDateString(new Date())).toBe(false);
      expect(isDateString({})).toBe(false);
      expect(isDateString(null)).toBe(false);
      expect(isDateString(undefined)).toBe(false);
    });
  });
  
  describe('isArray', () => {
    it('should return true if the value is an array', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });
    
    it('should return false if the value is not an array', () => {
      expect(isArray({})).toBe(false);
      expect(isArray('test')).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });
  });
  
  describe('isObject', () => {
    it('should return true if the value is an object', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ foo: 'bar' })).toBe(true);
    });
    
    it('should return false if the value is an array', () => {
      expect(isObject([])).toBe(false);
    });
    
    it('should return false if the value is null', () => {
      expect(isObject(null)).toBe(false);
    });
    
    it('should return false if the value is not an object', () => {
      expect(isObject('test')).toBe(false);
      expect(isObject(123)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });
  });
  
  describe('isFunction', () => {
    it('should return true if the value is a function', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function() {})).toBe(true);
      expect(isFunction(isFunction)).toBe(true);
    });
    
    it('should return false if the value is not a function', () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction('test')).toBe(false);
      expect(isFunction(123)).toBe(false);
      expect(isFunction(null)).toBe(false);
      expect(isFunction(undefined)).toBe(false);
    });
  });
  
  describe('isPromise', () => {
    it('should return true if the value is a Promise', () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise(new Promise(() => {}))).toBe(true);
    });
    
    it('should return true if the value is a thenable object', () => {
      expect(isPromise({ then: () => {}, catch: () => {} })).toBe(true);
    });
    
    it('should return false if the value is not a Promise', () => {
      expect(isPromise({})).toBe(false);
      expect(isPromise('test')).toBe(false);
      expect(isPromise(123)).toBe(false);
      expect(isPromise(null)).toBe(false);
      expect(isPromise(undefined)).toBe(false);
    });
  });
  
  describe('is', () => {
    it('should return true if the value matches the type guard', () => {
      expect(is('test', isString)).toBe(true);
      expect(is(123, isNumber)).toBe(true);
    });
    
    it('should return false if the value does not match the type guard', () => {
      expect(is('test', isNumber)).toBe(false);
      expect(is(123, isString)).toBe(false);
    });
  });
  
  describe('areAll', () => {
    it('should return true if all values match the type guard', () => {
      expect(areAll(['a', 'b', 'c'], isString)).toBe(true);
      expect(areAll([1, 2, 3], isNumber)).toBe(true);
    });
    
    it('should return false if any value does not match the type guard', () => {
      expect(areAll(['a', 'b', 3], isString)).toBe(false);
      expect(areAll([1, '2', 3], isNumber)).toBe(false);
    });
  });
  
  describe('safeCast', () => {
    it('should return the value if it matches the type guard', () => {
      expect(safeCast('test', isString, 'default')).toBe('test');
      expect(safeCast(123, isNumber, 0)).toBe(123);
    });
    
    it('should return the default value if the value does not match the type guard', () => {
      expect(safeCast(123, isString, 'default')).toBe('default');
      expect(safeCast('test', isNumber, 0)).toBe(0);
    });
  });
  
  describe('safeGet', () => {
    it('should return the property value if the object exists and has the property', () => {
      expect(safeGet({ foo: 'bar' }, 'foo', 'default')).toBe('bar');
    });
    
    it('should return the default value if the object is null', () => {
      expect(safeGet(null, 'foo', 'default')).toBe('default');
    });
    
    it('should return the default value if the object is undefined', () => {
      expect(safeGet(undefined, 'foo', 'default')).toBe('default');
    });
    
    it('should return the default value if the object does not have the property', () => {
      expect(safeGet({}, 'foo', 'default')).toBe('default');
    });
  });
});
