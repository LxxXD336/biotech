import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Window/DOM shims commonly needed by components
if (!('matchMedia' in window)) {
  // @ts-ignore
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

// Smooth scroll target
// @ts-ignore
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = vi.fn();

// Observers used by animation/visibility hooks
// @ts-ignore
if (!globalThis.IntersectionObserver) {
  // @ts-ignore
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() { return []; }
  } as any;
}

// @ts-ignore
if (!globalThis.ResizeObserver) {
  // @ts-ignore
  globalThis.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any;
}

// Fullscreen API stubs
// @ts-ignore
if (!document.exitFullscreen) document.exitFullscreen = vi.fn();
// @ts-ignore
if (!HTMLElement.prototype.requestFullscreen) HTMLElement.prototype.requestFullscreen = vi.fn();

// ---- Jest compatibility shim (so existing Jest-style tests run in Vitest) ----
// Provide a minimal `jest` global that proxies to `vi`.
// @ts-ignore
if (!globalThis.jest) {
  // @ts-ignore
  globalThis.jest = {
    fn: vi.fn.bind(vi),
    spyOn: vi.spyOn.bind(vi),
    mock: vi.mock.bind(vi),
    unmock: (vi as any).unmock?.bind(vi),
    doMock: (vi as any).doMock?.bind(vi),
    resetAllMocks: vi.resetAllMocks.bind(vi),
    clearAllMocks: vi.clearAllMocks.bind(vi),
    useFakeTimers: vi.useFakeTimers.bind(vi),
    useRealTimers: vi.useRealTimers.bind(vi),
    setSystemTime: vi.setSystemTime.bind(vi),
    advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
    runAllTimers: vi.runAllTimers.bind(vi),
  } as any;
}

// ---- Global mocks equivalent to Jest's setupTests.ts ----
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('div', domProps, children);
    },
    header: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('header', domProps, children);
    },
    span: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('span', domProps, children);
    },
    h1: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('h1', domProps, children);
    },
    h2: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('h2', domProps, children);
    },
    h3: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('h3', domProps, children);
    },
    p: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('p', domProps, children);
    },
    section: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('section', domProps, children);
    },
    button: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('button', domProps, children);
    },
    a: ({ children, to, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('a', { href: to, ...domProps }, children);
    },
    iframe: ({ children, ...props }: any) => {
      const React = require('react');
      const { whileHover, whileTap, whileInView, animate, initial, transition, viewport, ...domProps } = props || {};
      return React.createElement('iframe', domProps, children);
    },
  },
  useInView: () => true,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => {
    const React = require('react');
    return React.createElement('a', { href: to, ...props }, children);
  },
}));
