import { z } from 'zod';
import {
  validateWithZod,
  validateWithResult,
  formatZodErrors,
  getZodErrorMessages,
  CommonSchemas,
  StorySchema,
} from '../validation';
import { createValidationError } from '../enhanced-error-handler';

// Mock the createValidationError function
jest.mock('../enhanced-error-handler', () => ({
  createValidationError: jest.fn().mockImplementation((message, details) => ({
    message,
    details,
  })),
}));

describe('Validation Utilities', () => {
  describe('validateWithZod', () => {
    it('should return the validated data if valid', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      const data = { name: 'John', age: 30 };
      const result = validateWithZod(schema, data);
      
      expect(result).toEqual(data);
    });
    
    it('should throw a validation error if invalid', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      const data = { name: 'John', age: 'thirty' };
      
      expect(() => validateWithZod(schema, data)).toThrow();
      expect(createValidationError).toHaveBeenCalled();
    });
    
    it('should use the provided error message', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      const data = { name: 'John', age: 'thirty' };
      const errorMessage = 'Custom error message';
      
      expect(() => validateWithZod(schema, data, errorMessage)).toThrow();
      expect(createValidationError).toHaveBeenCalledWith(
        errorMessage,
        expect.any(Object)
      );
    });
  });
  
  describe('validateWithResult', () => {
    it('should return success and data if valid', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      const data = { name: 'John', age: 30 };
      const result = validateWithResult(schema, data);
      
      expect(result).toEqual({
        success: true,
        data,
      });
    });
    
    it('should return failure and errors if invalid', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      const data = { name: 'John', age: 'thirty' };
      const result = validateWithResult(schema, data);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors?.age).toBeDefined();
    });
  });
  
  describe('formatZodErrors', () => {
    it('should format Zod errors into a user-friendly format', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        email: z.string().email(),
      });
      
      const data = { name: 123, age: 'thirty', email: 'invalid' };
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const formattedErrors = formatZodErrors(result.error);
        
        expect(formattedErrors.name).toBeDefined();
        expect(formattedErrors.age).toBeDefined();
        expect(formattedErrors.email).toBeDefined();
      } else {
        fail('Schema validation should have failed');
      }
    });
    
    it('should handle nested errors', () => {
      const schema = z.object({
        user: z.object({
          name: z.string(),
          age: z.number(),
        }),
      });
      
      const data = { user: { name: 123, age: 'thirty' } };
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const formattedErrors = formatZodErrors(result.error);
        
        expect(formattedErrors['user.name']).toBeDefined();
        expect(formattedErrors['user.age']).toBeDefined();
      } else {
        fail('Schema validation should have failed');
      }
    });
    
    it('should handle array errors', () => {
      const schema = z.object({
        users: z.array(z.object({
          name: z.string(),
        })),
      });
      
      const data = { users: [{ name: 'John' }, { name: 123 }] };
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const formattedErrors = formatZodErrors(result.error);
        
        expect(formattedErrors['users.1.name']).toBeDefined();
      } else {
        fail('Schema validation should have failed');
      }
    });
  });
  
  describe('getZodErrorMessages', () => {
    it('should return an array of error messages', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      
      const data = { name: 123, age: 'thirty' };
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const errorMessages = getZodErrorMessages(result.error);
        
        expect(errorMessages).toBeInstanceOf(Array);
        expect(errorMessages.length).toBe(2);
      } else {
        fail('Schema validation should have failed');
      }
    });
  });
  
  describe('CommonSchemas', () => {
    it('should validate a non-empty string', () => {
      expect(CommonSchemas.nonEmptyString.safeParse('test').success).toBe(true);
      expect(CommonSchemas.nonEmptyString.safeParse('').success).toBe(false);
    });
    
    it('should validate an email', () => {
      expect(CommonSchemas.email.safeParse('test@example.com').success).toBe(true);
      expect(CommonSchemas.email.safeParse('invalid').success).toBe(false);
    });
    
    it('should validate a URL', () => {
      expect(CommonSchemas.url.safeParse('https://example.com').success).toBe(true);
      expect(CommonSchemas.url.safeParse('invalid').success).toBe(false);
    });
    
    it('should validate a date string', () => {
      expect(CommonSchemas.dateString.safeParse('2024-03-24').success).toBe(true);
      expect(CommonSchemas.dateString.safeParse('invalid').success).toBe(false);
    });
    
    it('should validate a slug', () => {
      expect(CommonSchemas.slug.safeParse('test-slug').success).toBe(true);
      expect(CommonSchemas.slug.safeParse('Test Slug').success).toBe(false);
    });
  });
  
  describe('StorySchema', () => {
    it('should validate a valid story', () => {
      const story = {
        title: 'Test Story',
        slug: 'test-story',
        summary: 'This is a test story',
        content: 'This is the content of the test story',
        date: '2024-03-24',
        country: 'Australia',
        type: 'Travel News',
      };
      
      const result = StorySchema.safeParse(story);
      expect(result.success).toBe(true);
    });
    
    it('should reject an invalid story', () => {
      const story = {
        title: '',
        slug: 'Invalid Slug',
        summary: '',
        content: '',
        date: 'invalid',
        country: '',
        type: '',
      };
      
      const result = StorySchema.safeParse(story);
      expect(result.success).toBe(false);
    });
  });
});
