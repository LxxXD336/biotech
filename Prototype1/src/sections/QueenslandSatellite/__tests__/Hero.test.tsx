import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from '../Hero';

// Mock the image import
jest.mock('../../QueenslandSatelliteResource/Queensland.png', () => 'mocked-queensland-image.png');

// Mock Container component
jest.mock('../../../components/common', () => ({
  Container: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe('QueenslandSatellite Hero Component', () => {
  beforeEach(() => {
    render(<Hero />);
  });

  it('renders the component without crashing', () => {
    expect(document.querySelector('.qld-section')).toBeInTheDocument();
  });

  it('displays the main tagline', () => {
    // Check for the full tagline text since Editable component wraps it
    expect(screen.getByText('The BIOTech Futures Challenge will take place in QLD')).toBeInTheDocument();
  });

  it('displays the main title', () => {
    // Check for the full title text since Editable component wraps it
    expect(screen.getByText('QUEENSLAND CHAPTER')).toBeInTheDocument();
  });

  it('renders the background image', () => {
    const image = screen.getByAltText('Queensland Chapter Background');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mocked-queensland-image.png');
  });

  it('has correct section class', () => {
    const section = document.querySelector('.qld-section');
    expect(section).toHaveClass('qld-section');
  });

  it('has correct container class', () => {
    const container = document.querySelector('.qld-container');
    expect(container).toBeInTheDocument();
  });

  it('displays the tagline with correct styling', () => {
    const tagline = document.querySelector('.qld-tagline');
    expect(tagline).toHaveClass('qld-tagline', 'hover-gradient-text');
  });

  it('displays the title with correct styling', () => {
    const title = document.querySelector('.qld-title');
    expect(title).toHaveClass('qld-title', 'hover-gradient-text');
  });

  it('renders the background container with correct classes', () => {
    const bgContainer = document.querySelector('.qld-bg');
    expect(bgContainer).toBeInTheDocument();
  });

  it('renders the background image with correct classes', () => {
    const image = screen.getByAltText('Queensland Chapter Background');
    expect(image).toHaveClass('qld-bg-img');
  });

  it('renders the overlay div', () => {
    const overlay = screen.getByAltText('Queensland Chapter Background').parentElement?.querySelector('.qld-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('renders the header container with correct class', () => {
    const header = document.querySelector('.qld-header');
    expect(header).toBeInTheDocument();
  });

  it('has proper text content structure', () => {
    const tagline = document.querySelector('.qld-tagline');
    const title = document.querySelector('.qld-title');
    
    expect(tagline).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('renders motion components correctly', () => {
    // Test that motion components are rendered as regular HTML elements
    expect(document.querySelector('.qld-section')).toBeInTheDocument();
    expect(document.querySelector('.qld-title')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    const section = document.querySelector('.qld-section');
    const heading = screen.getByRole('heading', { level: 2 });
    
    expect(section).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
  });

  it('contains all expected text content', () => {
    // Check for full text content since Editable component wraps it
    expect(screen.getByText('The BIOTech Futures Challenge will take place in QLD')).toBeInTheDocument();
    expect(screen.getByText('QUEENSLAND CHAPTER')).toBeInTheDocument();
    expect(screen.getByText('The BIOTech Futures Challenge is about to begin in Queensland. Register now before competition entries close July 12.')).toBeInTheDocument();
  });

  it('has proper image attributes', () => {
    const image = screen.getByAltText('Queensland Chapter Background');
    expect(image).toHaveAttribute('src', 'mocked-queensland-image.png');
    expect(image).toHaveClass('qld-bg-img');
  });

  it('renders with correct layout structure', () => {
    const section = document.querySelector('.qld-section');
    expect(section).toHaveClass('qld-section');
    
    const container = document.querySelector('.qld-container');
    expect(container).toBeInTheDocument();
  });

  it('renders split text functionality', () => {
    // Check that text elements exist (they will be split by Framer Motion)
    const tagline = document.querySelector('.qld-tagline');
    expect(tagline).toBeInTheDocument();
    
    const title = document.querySelector('.qld-title');
    expect(title).toBeInTheDocument();
  });
});
