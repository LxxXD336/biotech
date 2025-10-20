// src/__tests__/MomentsMarquee.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// ---- Mock: ../components/common ----
// 1) Container renders children and exposes data-testid for assertions
// 2) COLORS.white fixed to #fff to check outer background color
jest.mock('../../../components/common', () => ({
  Container: ({ children, className }: any) => (
      <div data-testid="container" className={className}>
        {children}
      </div>
  ),
  COLORS: { white: '#fff' },
}));

import MomentsMarquee from '../MomentsMarquee';

describe('MomentsMarquee', () => {
  const WORDS = ['Inspiration', 'Workshops', 'Teamwork', 'Innovation', 'Mentors', 'Showcase'];

  test('renders without crashing (no snapshot)', () => {
    const { container } = render(<MomentsMarquee />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('applies outer wrapper background color from COLORS.white', () => {
    const { container } = render(<MomentsMarquee />);
    const outer = container.firstChild as HTMLElement;
    // Robustly assert backgroundColor
    expect(outer).toHaveStyle({ backgroundColor: '#fff' });
  });

  test('passes classes to Container and renders marquee structure', () => {
    render(<MomentsMarquee />);

    // Container exists and keeps class
    const containerDiv = screen.getByTestId('container');
    expect(containerDiv).toBeInTheDocument();
    expect(containerDiv).toHaveClass('px-0', 'py-8', 'overflow-hidden');

    // marquee wrapper exists
    const marquee = containerDiv.querySelector('.marquee') as HTMLElement;
    expect(marquee).toBeInTheDocument();
  });

  test('renders 12 marquee items (6 words duplicated) with correct order', () => {
    render(<MomentsMarquee />);

    const marquee = screen.getByTestId('container').querySelector('.marquee')!;
    const items = Array.from(marquee.querySelectorAll('.marquee-item')) as HTMLElement[];
    expect(items).toHaveLength(WORDS.length * 2); // 12

    // First 6 should match WORDS order
    WORDS.forEach((w, i) => {
      expect(items[i]).toHaveTextContent(w);
    });

    // Next 6 should match WORDS order (duplication)
    WORDS.forEach((w, i) => {
      expect(items[i + WORDS.length]).toHaveTextContent(w);
    });
  });

  test('each word appears exactly twice', () => {
    render(<MomentsMarquee />);
    WORDS.forEach((w) => {
      const matches = screen.getAllByText(w);
      expect(matches).toHaveLength(2);
    });
  });
});
