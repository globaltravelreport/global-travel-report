import React from 'react';

// Mocks for Framer Motion
const motion = new Proxy({}, {
  get: (_, key: string) => (props: any) => {
    const Tag = key === 'div' ? 'div' : key === 'section' ? 'section' : 'span';
    return React.createElement(Tag, props, props.children);
  }
});

const AnimatePresence = ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children);
const useAnimation = () => ({ start: jest.fn() });
const useScroll = () => ({ scrollY: { onChange: jest.fn(), get: () => 0 } });
const useTransform = (input: any, _fn: (value: any) => any) => input;
const useMotionValue = (v: any) => v;
const m = motion;

module.exports = { motion, AnimatePresence, useAnimation, useScroll, useTransform, useMotionValue, m };
