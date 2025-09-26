import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge class names with Tailwind CSS
 * Combines clsx for conditional classes with tailwind-merge to handle conflicting classes
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * // Basic usage
 * cn('px-2 py-1', 'bg-red-500')
 * // => 'px-2 py-1 bg-red-500'
 * 
 * @example
 * // With conditionals
 * cn('px-2', isActive && 'bg-blue-500', !isActive && 'bg-gray-200')
 * // => 'px-2 bg-blue-500' or 'px-2 bg-gray-200'
 * 
 * @example
 * // With conflicting classes (tailwind-merge handles this)
 * cn('px-2 py-1 text-red-500', 'px-4 text-blue-500')
 * // => 'py-1 px-4 text-blue-500'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
