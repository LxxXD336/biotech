// src/__tests__/TheBriefSection.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TheBriefSection from '../TheBriefSection';

/**
 * Mock: framer-motion
 * Replace with a "no-animation" div and strip motion-only props to avoid React unknown prop warnings.
 */
jest.mock('framer-motion', () => {
  const React = require('react');
  const MotionStub = React.forwardRef((props: any, ref: any) => {
    const {
      children,
      // Remove motion-specific props that could cause DOM warnings
      whileHover, whileTap, initial, animate, transition, viewport,
      variants, exit, layout, layoutId, drag, dragConstraints,
      ...rest
    } = props || {};
    return React.createElement('div', { ref, ...rest }, children);
  });
  // Fallback motion.div / motion.span / motion.p to MotionStub
  const proxy = new Proxy({}, { get: () => MotionStub });
  return {
    __esModule: true,
    motion: proxy,
    useInView: () => true,
  };
});

describe('TheBriefSection', () => {
  test('renders the section landmark and accessible heading', () => {
    render(<TheBriefSection />);

    // Section and its aria-labelledby title "The Brief"
    const section = screen.getByRole('region', { name: /the brief/i });
    expect(section).toBeInTheDocument();

    const heading = screen.getByRole('heading', { name: /the brief/i, level: 2 });
    expect(heading).toBeInTheDocument();
  });

  test('renders the large headline keywords', () => {
    render(<TheBriefSection />);

    // Headline is split into chunks; assert per word
    ['DESIGN', 'SOMETHING', 'THAT', 'SOLVES', 'A', 'PROBLEM'].forEach(word => {
      expect(screen.getByText(new RegExp(`^${word}$`, 'i'))).toBeInTheDocument();
    });
  });

  test('renders copy and expandable "What judges look for" details', async () => {
    const user = userEvent.setup();
    render(<TheBriefSection />);

    // Intro paragraph (match a fragment)
    expect(
        screen.getByText(/The competition is open annually to students/i)
    ).toBeInTheDocument();

    // Details summary
    const summary = screen.getByText(/what judges look for/i);
    expect(summary.tagName.toLowerCase()).toBe('summary');

    // Ensure list items visible regardless of initial open/closed by clicking summary
    await user.click(summary);

    [
      /Clarity of problem/i,
      /Scientific rigor/i,
      /Creativity/i,
      /Collaboration/i,
    ].forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('renders sustainability/humanitarian emphasis sentence', () => {
    render(<TheBriefSection />);
    expect(
        screen.getByText(/sustainable issues/i)
    ).toBeInTheDocument();
    expect(
        screen.getByText(/humanitarian engineering/i)
    ).toBeInTheDocument();
  });

  test('renders the CTA button text', () => {
    render(<TheBriefSection />);
    // CTA is a styled div; assert by its text
    expect(
        screen.getByText(/find out how to enter/i)
    ).toBeInTheDocument();
  });

  test('does not print React unknown prop warnings from framer-motion', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<TheBriefSection />);
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
