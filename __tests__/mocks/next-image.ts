import React from 'react';

const NextImage = (props: any) => {
  return React.createElement('img', { ...props, 'data-testid': 'next-image' });
};
NextImage.displayName = 'Image';

const OptimizedImage = (props: any) => {
  return React.createElement('img', { ...props, 'data-testid': 'optimized-image' });
};
OptimizedImage.displayName = 'OptimizedImage';

module.exports = NextImage;
module.exports.OptimizedImage = OptimizedImage;
