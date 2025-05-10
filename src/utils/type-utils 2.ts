/**
 * Utility functions and types for improving TypeScript type safety
 */

/**
 * Ensures that a value is not null or undefined
 *
 * @param value - The value to check
 * @param errorMessage - Optional error message
 * @returns The non-null value
 * @throws Error if the value is null or undefined
 */
export function assertNonNullable<T>(
  value: T,
  errorMessage: string = 'Value is null or undefined'
): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(errorMessage);
  }
  return value as NonNullable<T>;
}

/**
 * Type guard to check if a value is not null or undefined
 *
 * @param value - The value to check
 * @returns True if the value is not null or undefined
 */
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if a value is a string
 *
 * @param value - The value to check
 * @returns True if the value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 *
 * @param value - The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 *
 * @param value - The value to check
 * @returns True if the value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is a Date
 *
 * @param value - The value to check
 * @returns True if the value is a Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is a valid date string
 *
 * @param value - The value to check
 * @returns True if the value is a valid date string
 */
export function isDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Type guard to check if a value is an array
 *
 * @param value - The value to check
 * @returns True if the value is an array
 */
export function isArray<T>(value: unknown): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is an object
 *
 * @param value - The value to check
 * @returns True if the value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard to check if a value is a function
 *
 * @param value - The value to check
 * @returns True if the value is a function
 */
export function isFunction(value: unknown): value is ((...args: any[]) => any) {
  return typeof value === 'function';
}

/**
 * Type guard to check if a value is a promise
 *
 * @param value - The value to check
 * @returns True if the value is a promise
 */
export function isPromise<T = any>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    isObject(value) &&
    isFunction((value as any).then) &&
    isFunction((value as any).catch)
  );
}

/**
 * Type guard to check if a value matches a specific type
 *
 * @param value - The value to check
 * @param typeGuard - The type guard function
 * @returns True if the value matches the type
 */
export function is<T>(value: unknown, typeGuard: (value: unknown) => value is T): value is T {
  return typeGuard(value);
}

/**
 * Type guard to check if all values in an array match a specific type
 *
 * @param values - The array to check
 * @param typeGuard - The type guard function
 * @returns True if all values match the type
 */
export function areAll<T>(values: unknown[], typeGuard: (value: unknown) => value is T): values is T[] {
  return values.every(value => typeGuard(value));
}

/**
 * Safely cast a value to a specific type if it matches a type guard
 *
 * @param value - The value to cast
 * @param typeGuard - The type guard function
 * @param defaultValue - The default value to return if the type guard fails
 * @returns The cast value or the default value
 */
export function safeCast<T>(
  value: unknown,
  typeGuard: (value: unknown) => value is T,
  defaultValue: T
): T {
  return typeGuard(value) ? value : defaultValue;
}

/**
 * Safely access a property of an object
 *
 * @param obj - The object to access
 * @param key - The property key
 * @param defaultValue - The default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function safeGet<T extends object, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K]
): T[K] {
  return obj && key in obj ? obj[key] : defaultValue;
}

/**
 * Type for a record with string keys and values of a specific type
 */
export type StringRecord<T> = Record<string, T>;

/**
 * Type for a record with number keys and values of a specific type
 */
export type NumberRecord<T> = Record<number, T>;

/**
 * Type for a nullable value
 */
export type Nullable<T> = T | null | undefined;

/**
 * Type for a value that can be a single item or an array of items
 */
export type MaybeArray<T> = T | T[];

/**
 * Type for a value that can be a promise or a direct value
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Type for a function that returns a value or a promise of a value
 */
export type AsyncFunction<T, Args extends any[] = any[]> = (...args: Args) => Promise<T>;

/**
 * Type for a function that returns a value or a promise of a value
 */
export type MaybeAsyncFunction<T, Args extends any[] = any[]> = (...args: Args) => T | Promise<T>;

/**
 * Type for a deep partial object
 */
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

/**
 * Type for a deep required object
 */
export type DeepRequired<T> = T extends object ? {
  [P in keyof T]-?: DeepRequired<T[P]>;
} : T;

/**
 * Type for a deep readonly object
 */
export type DeepReadonly<T> = T extends object ? {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
} : T;

/**
 * Type for a pick with deep partial
 */
export type PartialPick<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>;

/**
 * Type for a function parameter
 */
export type FunctionParameter<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * Type for a function return type
 */
export type FunctionReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never;

/**
 * Type for a constructor parameter
 */
export type ConstructorParameter<T extends new (...args: any[]) => any> = T extends new (...args: infer P) => any ? P : never;

/**
 * Type for a constructor instance
 */
export type ConstructorInstance<T extends new (...args: any[]) => any> = T extends new (...args: any[]) => infer R ? R : never;

/**
 * Type for a value that can be one of multiple types
 */
export type OneOf<T extends any[]> = T[number];

/**
 * Type for a value that must have at least the specified keys
 */
export type RequiredKeys<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

/**
 * Type for a value that must have exactly the specified keys
 */
export type ExactKeys<T, K extends keyof T> = Pick<T, K>;

const typeUtils = {
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
};

export default typeUtils;
