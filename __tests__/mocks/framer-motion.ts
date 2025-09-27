const React = require('react');

// Mocks for Framer Motion
const motion = new Proxy({}, {
  get: (_, key) => (props) => {
    const Tag = key === 'div' ? 'div' : key === 'section' ? 'section' : 'span';
    return React.createElement(Tag, props, props.children);
  }
});

const AnimatePresence = ({ children }) => React.createElement(React.Fragment, null, children);
const useAnimation = () => ({ start: jest.fn() });
const useScroll = () => ({ scrollY: { onChange: jest.fn(), get: () => 0 } });
const useTransform = (input, fn) => input;
const useMotionValue = (v) => v;
const m = motion;

module.exports = { motion, AnimatePresence, useAnimation, useScroll, useTransform, useMotionValue, m };
