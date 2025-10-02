// useFormValidation hook for client-side and server-side validation
'use client';

import { useState } from 'react';
import { ZodSchema, ZodError } from 'zod';
import { useCsrfToken } from './useCsrfToken';

export function useFormValidation<T>(schema: ZodSchema<T>, initial: T) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { csrfToken } = useCsrfToken();

  function validateField<K extends keyof T>(field: K, value: T[K]) {
    try {
      // For field validation, we'll use the entire schema with just the field value
      // This is a simplified approach - in a real implementation you might want to create
      // a more sophisticated field-level validation
      const testData = { [field]: value } as T;
      schema.parse(testData);
      setErrors(e => ({ ...e, [field as string]: '' }));
    } catch (err) {
      if (err instanceof ZodError) {
        setErrors(e => ({ ...e, [field as string]: err.errors[0]?.message || 'Invalid' }));
      }
    }
  }

  function handleChange<K extends keyof T>(field: K, value: T[K]) {
    setValues(v => ({ ...v, [field]: value }));
    validateField(field, value);
  }

  async function handleSubmit(submitFn: (data: T & { csrfToken: string }) => Promise<any>) {
    setLoading(true);
    setSuccess(false);
    setErrors({});
    try {
      schema.parse(values);
      if (!csrfToken) {
        throw new Error('CSRF token not available');
      }
      await submitFn({ ...values, csrfToken });
      setSuccess(true);
    } catch (err: any) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(e => { if (e.path[0]) fieldErrors[e.path[0] as string] = e.message; });
        setErrors(fieldErrors);
      } else if (err?.response?.status === 429) {
        setErrors({ _form: 'Too many requests. Please try again later.' });
      } else {
        setErrors({ _form: 'An unexpected error occurred.' });
      }
    } finally {
      setLoading(false);
    }
  }

  return { values, errors, loading, success, handleChange, handleSubmit };
}
