import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from '../Hero';

// Mock the image import
jest.mock('../../VictoriaSatelliteResource/Hero.png', () => 'mocked-vic-hero-image.png');

// Mock Container component
jest.mock('../../../components/common', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe('VictoriaSatellite Hero Component', () => {
  beforeEach(() => {
    render(<Hero />);
  });

  it('renders the component without crashing', () => {
    expect(document.querySelector('.vic-section')).toBeInTheDocument();
  });

  it('displays the main tagline', () => {
    // Check for the full tagline text since Editable component wraps it
    expect(screen.getByText('THE BIOTECH FUTURES CHALLENGE WILL TAKE PLACE IN VIC')).toBeInTheDocument();
  });

  it('displays the main title', () => {
    // Check for the full title text since Editable component wraps it
    expect(screen.getByText('VICTORIA CHAPTER')).toBeInTheDocument();
  });

  it('renders the background image', () => {
    const image = screen.getByAltText('Victoria Chapter Background');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mocked-vic-hero-image.png');
  });

  it('has correct section class', () => {
    const section = document.querySelector('.vic-section');
    expect(section).toHaveClass('vic-section');
  });

  it('has correct container class', () => {
    const container = document.querySelector('.vic-container');
    expect(container).toBeInTheDocument();
  });

  it('displays the tagline with correct styling', () => {
    const tagline = document.querySelector('.vic-tagline');
    expect(tagline).toHaveClass('vic-tagline', 'hover-gradient-text');
  });

  it('displays the title with correct styling', () => {
    const title = document.querySelector('.vic-title');
    expect(title).toHaveClass('vic-title', 'hover-gradient-text');
  });

  it('renders the background container with correct classes', () => {
    const bgContainer = screen.getByAltText('Victoria Chapter Background').closest('.vic-bg');
    expect(bgContainer).toBeInTheDocument();
  });

  it('renders the background image with correct classes', () => {
    const image = screen.getByAltText('Victoria Chapter Background');
    expect(image).toHaveClass('vic-bg-img');
  });

  it('renders the overlay div', () => {
    const overlay = screen.getByAltText('Victoria Chapter Background').parentElement?.querySelector('.vic-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('renders the header container with correct class', () => {
    const header = document.querySelector('.vic-header');
    expect(header).toBeInTheDocument();
  });

  it('has proper text content structure', () => {
    const tagline = document.querySelector('.vic-tagline');
    const title = document.querySelector('.vic-title');
    
    expect(tagline).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('renders motion components correctly', () => {
    // Test that motion components are rendered as regular HTML elements
    expect(document.querySelector('.vic-section')).toBeInTheDocument();
    expect(document.querySelector('.vic-title')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    const section = document.querySelector('.vic-section');
    const heading = screen.getByRole('heading', { level: 2 });
    
    expect(section).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
  });

  it('contains all expected text content', () => {
    // Check for full text content since Editable component wraps it
    expect(screen.getByText('THE BIOTECH FUTURES CHALLENGE WILL TAKE PLACE IN VIC')).toBeInTheDocument();
    expect(screen.getByText('VICTORIA CHAPTER')).toBeInTheDocument();
    expect(screen.getByText('The Challenge in Victoria has now started. Good luck to our participating teams and mentors!')).toBeInTheDocument();
  });

  it('has proper image attributes', () => {
    const image = screen.getByAltText('Victoria Chapter Background');
    expect(image).toHaveAttribute('src', 'mocked-vic-hero-image.png');
    expect(image).toHaveClass('vic-bg-img');
  });

  it('renders with correct layout structure', () => {
    const section = document.querySelector('.vic-section');
    expect(section).toHaveClass('vic-section');
    
    const container = document.querySelector('.vic-container');
    expect(container).toBeInTheDocument();
  });

  it('renders split text functionality', () => {
    // Check that text elements exist (they will be split by Framer Motion)
    const tagline = document.querySelector('.vic-tagline');
    expect(tagline).toBeInTheDocument();
    
    const title = document.querySelector('.vic-title');
    expect(title).toBeInTheDocument();
  });

  it('has correct Victoria-specific styling classes', () => {
    const section = document.querySelector('.vic-section');
    expect(section).toHaveClass('vic-section');
    
    const container = document.querySelector('.vic-container');
    expect(container).toBeInTheDocument();
    
    const tagline = document.querySelector('.vic-tagline');
    expect(tagline).toHaveClass('vic-tagline');
    
    const title = document.querySelector('.vic-title');
    expect(title).toHaveClass('vic-title');
  });

  it('renders background elements correctly', () => {
    const bgContainer = screen.getByAltText('Victoria Chapter Background').closest('.vic-bg');
    const image = screen.getByAltText('Victoria Chapter Background');
    const overlay = bgContainer?.querySelector('.vic-overlay');
    
    expect(bgContainer).toBeInTheDocument();
    expect(image).toHaveClass('vic-bg-img');
    expect(overlay).toBeInTheDocument();
  });

  it('has proper gradient text styling', () => {
    const tagline = document.querySelector('.vic-tagline');
    const title = document.querySelector('.vic-title');
    
    expect(tagline).toHaveClass('hover-gradient-text');
    expect(title).toHaveClass('hover-gradient-text');
  });

  it('renders motion elements correctly', () => {
    const section = document.querySelector('.vic-section');
    const header = document.querySelector('.vic-header');
    
    expect(section).toBeInTheDocument();
    expect(header).toBeInTheDocument();
  });

  it('displays Victoria-specific content', () => {
    expect(screen.getByText('VICTORIA CHAPTER')).toBeInTheDocument();
    expect(screen.getByText('THE BIOTECH FUTURES CHALLENGE WILL TAKE PLACE IN VIC')).toBeInTheDocument();
  });

  it('has proper hero section structure', () => {
    const section = document.querySelector('.vic-section');
    expect(section).toHaveClass('vic-section');
    
    const bgContainer = screen.getByAltText('Victoria Chapter Background').closest('.vic-bg');
    expect(bgContainer).toBeInTheDocument();
  });
});
