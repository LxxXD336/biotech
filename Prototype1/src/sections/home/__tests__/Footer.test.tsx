import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Link with plain <a> to avoid BrowserRouter dependency
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...rest }: any) => (
      <a href={to as string} {...rest}>
        {children}
      </a>
  ),
}));

// Mock colors to assert inline styles
jest.mock('../../../components/common', () => ({
  COLORS: {
    green: '#017151',
    yellow: '#F1E5A6',
    lime: '#b6f0c2',
  },
}));

// Component under test
import Footer from '../Footer';

describe('Footer', () => {
  test('renders basic sections and headings', () => {
    render(<Footer />);

    // Semantic footer
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();

    // Three sub-headings
    expect(
        screen.getByRole('heading', { level: 4, name: /BIOTech Futures/i })
    ).toBeInTheDocument();
    expect(
        screen.getByRole('heading', { level: 4, name: /Quick links/i })
    ).toBeInTheDocument();
    expect(
        screen.getByRole('heading', { level: 4, name: /Subscribe/i })
    ).toBeInTheDocument();

    // Short description
    expect(
        screen.getByText('Inspiring the future leaders of science and innovation.')
    ).toBeInTheDocument();
  });

  test('footer background comes from COLORS.green', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveStyle('background-color: #017151');
  });

  test('quick links and router links', () => {
    render(<Footer />);

    // About uses Link (mocked to <a>), points to /
    const about = screen.getByRole('link', { name: 'About' });
    expect(about).toHaveAttribute('href', '/');
    expect(about).toHaveClass('hover:underline', 'text-white');

    // Other external links are plain <a> pointing to #
    expect(screen.getByRole('link', { name: 'News' })).toHaveAttribute('href', '#');
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#');
    expect(screen.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '#');
  });

  test('subscribe form: input and button text/styles', () => {
    render(<Footer />);

    // Placeholder and classes
    const email = screen.getByPlaceholderText('Email address') as HTMLInputElement;
    expect(email).toBeInTheDocument();
    expect(email).toHaveClass('flex-1', 'px-3', 'py-2', 'rounded-md', 'text-black');
    // Border color from COLORS.lime
    expect(email).toHaveStyle('border: 1px solid #b6f0c2');

    // Button label and styles
    const btn = screen.getByRole('button', { name: 'Sign up' });
    expect(btn).toHaveClass('px-4', 'py-2', 'rounded-md', 'text-black', 'hover:opacity-95', 'transition');
    // Background color from COLORS.yellow
    expect(btn).toHaveStyle('background-color: #F1E5A6');
  });

  test('main grid layout class names exist', () => {
    render(<Footer />);
    // Outermost layout container inside footer
    const grid = screen.getByRole('contentinfo').querySelector('div.max-w-6xl');
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass(
        'max-w-6xl',
        'mx-auto',
        'px-6',
        'py-12',
        'grid',
        'md:grid-cols-3',
        'gap-6',
        'text-white'
    );
  });

  test('inline font-family styles exist on headings and description', () => {
    render(<Footer />);

    const h4s = screen.getAllByRole('heading', { level: 4 });
    h4s.forEach((h4) => {
      expect(h4).toHaveStyle('font-family: Arial, Helvetica, sans-serif');
    });

    const desc = screen.getByText('Inspiring the future leaders of science and innovation.');
    expect(desc).toHaveClass('text-white/90', 'text-sm');
    expect(desc).toHaveStyle('font-family: Arial, Helvetica, sans-serif');
  });
});
