import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require('react');
      // Filter out framer-motion specific props
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('div', domProps, children);
    },
    header: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('header', domProps, children);
    },
    span: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('span', domProps, children);
    },
    h1: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('h1', domProps, children);
    },
    h2: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('h2', domProps, children);
    },
    h3: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('h3', domProps, children);
    },
    p: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('p', domProps, children);
    },
    section: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('section', domProps, children);
    },
    button: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('button', domProps, children);
    },
    a: ({ children, to, ...props }: any) => { // Added 'to' prop for Link mock compatibility
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('a', { href: to, ...domProps }, children); // Pass 'to' as 'href'
    },
    iframe: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props;
      return React.createElement('iframe', domProps, children);
    },
  },
  useInView: () => true,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => {
    const React = require('react');
    return React.createElement('a', { href: to, ...props }, children);
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
(global as any).ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock fullscreen API
Object.defineProperty(document, 'fullscreenElement', {
  writable: true,
  value: null,
});

Object.defineProperty(document, 'exitFullscreen', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(document, 'webkitExitFullscreen', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(document, 'msExitFullscreen', {
  writable: true,
  value: jest.fn(),
});

// Mock requestFullscreen
Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLElement.prototype, 'webkitRequestFullscreen', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLElement.prototype, 'msRequestFullscreen', {
  writable: true,
  value: jest.fn(),
});

import '@testing-library/jest-dom';

Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

