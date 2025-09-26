import {
  EnhancedAppError,
  ErrorType,
  ErrorSeverity,
  handleError,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createNetworkError,
} from '../enhanced-error-handler';

describe('Enhanced Error Handler', () => {
  describe('EnhancedAppError', () => {
    it('should create an error with the correct properties', () => {
      const error = new EnhancedAppError(
        'Test error',
        ErrorType.VALIDATION,
        ErrorSeverity.WARNING,
        'TEST_ERROR',
        { field: 'test' },
        { component: 'TestComponent' }
      );
      
      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.WARNING);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'test' });
      expect(error.context).toEqual({ component: 'TestComponent' });
      expect(error.logged).toBe(false);
      expect(error.id).toBeDefined();
      expect(error.timestamp).toBeInstanceOf(Date);
    });
    
    it('should have a stack trace', () => {
      const error = new EnhancedAppError('Test error');
      expect(error.stack).toBeDefined();
    });
    
    it('should check if the error is a specific type', () => {
      const error = new EnhancedAppError('Test error', ErrorType.VALIDATION);
      expect(error.isType(ErrorType.VALIDATION)).toBe(true);
      expect(error.isType(ErrorType.AUTHENTICATION)).toBe(false);
    });
    
    it('should check if the error is at least a specific severity', () => {
      const error = new EnhancedAppError('Test error', ErrorType.UNKNOWN, ErrorSeverity.ERROR);
      expect(error.isAtLeastSeverity(ErrorSeverity.WARNING)).toBe(true);
      expect(error.isAtLeastSeverity(ErrorSeverity.ERROR)).toBe(true);
      expect(error.isAtLeastSeverity(ErrorSeverity.CRITICAL)).toBe(false);
    });
    
    it('should get a user-friendly error message', () => {
      const validationError = new EnhancedAppError('Test error', ErrorType.VALIDATION);
      expect(validationError.getUserMessage()).toContain('invalid');
      
      const authError = new EnhancedAppError('Test error', ErrorType.AUTHENTICATION);
      expect(authError.getUserMessage()).toContain('sign in');
      
      const notFoundError = new EnhancedAppError('Test error', ErrorType.NOT_FOUND);
      expect(notFoundError.getUserMessage()).toContain('not found');
      
      const unknownError = new EnhancedAppError('Test error');
      expect(unknownError.getUserMessage()).toContain('unexpected');
    });
    
    it('should get a detailed error report', () => {
      const error = new EnhancedAppError('Test error');
      const report = error.getDetailedReport();
      
      expect(report.id).toBe(error.id);
      expect(report.name).toBe(error.name);
      expect(report.message).toBe(error.message);
      expect(report.type).toBe(error.type);
      expect(report.severity).toBe(error.severity);
      expect(report.stack).toBe(error.stack);
      expect(report.timestamp).toBe(error.timestamp);
    });
  });
  
  describe('handleError', () => {
    it('should return the error if it is already an EnhancedAppError', () => {
      const originalError = new EnhancedAppError('Test error');
      const handledError = handleError(originalError);
      
      expect(handledError).toBe(originalError);
    });
    
    it('should convert a standard Error to an EnhancedAppError', () => {
      const originalError = new Error('Test error');
      const handledError = handleError(originalError);
      
      expect(handledError).toBeInstanceOf(EnhancedAppError);
      expect(handledError.message).toBe('Test error');
      expect(handledError.originalError).toBe(originalError);
    });
    
    it('should convert a string to an EnhancedAppError', () => {
      const handledError = handleError('Test error');
      
      expect(handledError).toBeInstanceOf(EnhancedAppError);
      expect(handledError.message).toBe('Test error');
    });
    
    it('should convert a non-Error object to an EnhancedAppError', () => {
      const originalError = { foo: 'bar' };
      const handledError = handleError(originalError);
      
      expect(handledError).toBeInstanceOf(EnhancedAppError);
      expect(handledError.message).toBe('An unknown error occurred');
      expect(handledError.details.originalError).toBe(originalError);
    });
    
    it('should include context if provided', () => {
      const context = { component: 'TestComponent' };
      const handledError = handleError('Test error', context);
      
      expect(handledError.context).toBe(context);
    });
    
    it('should try to determine the error type based on the error name or message', () => {
      const validationError = new Error('Validation failed');
      const handledValidationError = handleError(validationError);
      expect(handledValidationError.type).toBe(ErrorType.VALIDATION);
      
      const networkError = new Error('Network error');
      const handledNetworkError = handleError(networkError);
      expect(handledNetworkError.type).toBe(ErrorType.NETWORK);
      
      const notFoundError = new Error('Resource not found');
      const handledNotFoundError = handleError(notFoundError);
      expect(handledNotFoundError.type).toBe(ErrorType.NOT_FOUND);
    });
  });
  
  describe('Error creation helpers', () => {
    it('should create a validation error', () => {
      const error = createValidationError('Invalid input', { field: 'test' });
      
      expect(error).toBeInstanceOf(EnhancedAppError);
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.WARNING);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'test' });
    });
    
    it('should create an authentication error', () => {
      const error = createAuthenticationError('Not authenticated');
      
      expect(error).toBeInstanceOf(EnhancedAppError);
      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.severity).toBe(ErrorSeverity.ERROR);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
    });
    
    it('should create an authorization error', () => {
      const error = createAuthorizationError('Not authorized');
      
      expect(error).toBeInstanceOf(EnhancedAppError);
      expect(error.type).toBe(ErrorType.AUTHORIZATION);
      expect(error.severity).toBe(ErrorSeverity.ERROR);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });
    
    it('should create a not found error', () => {
      const error = createNotFoundError('Resource not found', 'user');
      
      expect(error).toBeInstanceOf(EnhancedAppError);
      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.severity).toBe(ErrorSeverity.WARNING);
      expect(error.code).toBe('NOT_FOUND_ERROR');
      expect(error.details).toEqual({ resource: 'user' });
    });
    
    it('should create a network error', () => {
      const error = createNetworkError('Network error');
      
      expect(error).toBeInstanceOf(EnhancedAppError);
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.ERROR);
      expect(error.code).toBe('NETWORK_ERROR');
    });
  });
});
