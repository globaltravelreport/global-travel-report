// Enhanced mocks for Next.js Image and OptimizedImage
// Handles all props, loading, error, responsive, optimization, accessibility

const React = require('react');

const NextImage = (props) => {
  return React.createElement('img', { ...props, 'data-testid': 'next-image' });
};
NextImage.displayName = 'Image';

const OptimizedImage = (props) => {
  return React.createElement('img', { ...props, 'data-testid': 'optimized-image' });
};
OptimizedImage.displayName = 'OptimizedImage';

module.exports = NextImage;
module.exports.OptimizedImage = OptimizedImage;
