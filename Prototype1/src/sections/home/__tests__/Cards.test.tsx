import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Cards from '../Cards';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  __esModule: true,
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

// Mock common components
jest.mock('../../../components/common', () => ({
  __esModule: true,
  COLORS: {
    lime: '#B6F0C2',
    yellow: '#FDE68A',
    lightBG: '#F8F9FA',
    charcoal: '#2D3748',
  },
  PageSection: ({ children, bg, id }: any) => (
    <section id={id} style={{ backgroundColor: bg }}>
      {children}
    </section>
  ),
  useReveal: () => React.useRef(null),
}));

const renderCards = () => render(<Cards />);

describe('Cards Component', () => {
  test('renders basic content', () => {
    renderCards();
    
    expect(screen.getByText('Get involved')).toBeInTheDocument();
    expect(screen.getByText('How to enter')).toBeInTheDocument();
    expect(screen.getByText('Symposium')).toBeInTheDocument();
    expect(screen.getByText('Work with us')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
  });

  test('contains 4 cards: 3 internal links + 1 external link', () => {
    renderCards();

    // 4 titles -> 4 cards
    const titles = screen.getAllByRole('heading', { level: 3 });
    expect(titles).toHaveLength(4);

    // internal Links are rendered as <a> by our Link mock
    const allAnchors = screen.getAllByRole('link');
    expect(allAnchors).toHaveLength(4);

    // Specifically: 3 internal (/getting-started, /past-winners, /mentorship) + 1 external (/gallery.html)
    const hrefs = allAnchors.map(a => a.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining(['/getting-started', '/past-winners', '/mentorship', '/gallery.html'])
    );
  });

  test('container node has reveal class for useReveal', () => {
    renderCards();
    const revealHost = screen.getByText('Get involved').parentElement as HTMLElement;
    expect(revealHost).toHaveClass('reveal');
  });

  test('renders all card descriptions', () => {
    renderCards();
    
    expect(screen.getByText('Steps for students and schools to participate in upcoming challenges.')).toBeInTheDocument();
    expect(screen.getByText('Explore highlights and resources from our annual gathering.')).toBeInTheDocument();
    expect(screen.getByText('Partner with BIOTech Futures to mentor and support young innovators.')).toBeInTheDocument();
    expect(screen.getByText('Browse photos from events, workshops, and projects.')).toBeInTheDocument();
  });

  test('internal links use Link component', () => {
    renderCards();
    
    const howToEnterLink = screen.getByText('How to enter').closest('a');
    const symposiumLink = screen.getByText('Symposium').closest('a');
    const workWithUsLink = screen.getByText('Work with us').closest('a');
    
    expect(howToEnterLink).toHaveAttribute('href', '/getting-started');
    expect(symposiumLink).toHaveAttribute('href', '/past-winners');
    expect(workWithUsLink).toHaveAttribute('href', '/mentorship');
  });

  test('external link uses plain anchor tag', () => {
    renderCards();
    
    const galleryLink = screen.getByText('Gallery').closest('a');
    expect(galleryLink).toHaveAttribute('href', '/gallery.html');
  });

  test('cards have correct classes', () => {
    renderCards();
    
    const cards = screen.getAllByRole('link');
    cards.forEach(card => {
      expect(card).toHaveClass('card-tilt');
    });
  });

  test('section has correct id and background', () => {
    renderCards();
    const section = document.querySelector('#get-involved') as HTMLElement;
    expect(section).toBeInTheDocument();
    expect(section).toHaveStyle('background-color: #F8F9FA');
  });

  test('responsive grid layout', () => {
    renderCards();
    
    const grid = screen.getByText('Get involved').nextElementSibling;
    expect(grid).toHaveClass('grid', 'md:grid-cols-2', 'lg:grid-cols-4', 'gap-6');
  });

  test('card title styles are correct', () => {
    renderCards();
    
    const titles = screen.getAllByRole('heading', { level: 3 });
    titles.forEach(title => {
      expect(title).toHaveClass('text-lg', 'font-semibold', 'mb-2');
      expect(title).toHaveStyle('color: #2D3748');
      expect(title).toHaveStyle('font-family: Arial, Helvetica, sans-serif');
    });
  });

  test('card description styles are correct', () => {
    renderCards();
    
    const descriptions = screen.getAllByText(/Steps for students|Explore highlights|Partner with BIOTech|Browse photos/);
    descriptions.forEach(desc => {
      expect(desc).toHaveClass('text-[15px]');
      expect(desc).toHaveStyle('color: #2D3748');
      expect(desc).toHaveStyle('font-family: Arial, Helvetica, sans-serif');
    });
  });

  test('card background colors are correct', () => {
    renderCards();
    
    const howToEnterCard = screen.getByText('How to enter').closest('a');
    const symposiumCard = screen.getByText('Symposium').closest('a');
    const workWithUsCard = screen.getByText('Work with us').closest('a');
    const galleryCard = screen.getByText('Gallery').closest('a');
    
    expect(howToEnterCard).toHaveStyle('background-color: #B6F0C2');
    expect(symposiumCard).toHaveStyle('background-color: #D6F0FF');
    expect(workWithUsCard).toHaveStyle('background-color: #FDE68A');
    expect(galleryCard).toHaveStyle('background-color: #F8F9FA');
  });

  test('main heading styles are correct', () => {
    renderCards();
    
    const mainTitle = screen.getByRole('heading', { level: 2 });
    expect(mainTitle).toHaveClass('text-2xl', 'md:text-3xl', 'font-bold', 'mb-7');
    expect(mainTitle).toHaveStyle('color: #2D3748');
    expect(mainTitle).toHaveStyle('font-family: Arial, Helvetica, sans-serif');
  });
});
