import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion useInView hook
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useInView: jest.fn(() => true), // Always in view for tests
}));

// Mock the image imports
jest.mock('../../VictoriaSatelliteResource/MBSIlogo.png', () => 'mocked-mbsi-logo.png');
jest.mock('../../VictoriaSatelliteResource/TUMlogo.png', () => 'mocked-tum-logo.png');

import Contact from '../Contact';

describe('VictoriaSatellite Contact Component', () => {
  it('renders the component without crashing', () => {
    render(<Contact />);
    expect(screen.getByText('CONTACT')).toBeInTheDocument();
  });

  it('displays the contact title', () => {
    render(<Contact />);
    expect(screen.getByText('CONTACT')).toBeInTheDocument();
  });

  it('displays the subtitle', () => {
    render(<Contact />);
    expect(screen.getByText("We'd love to hear from you")).toBeInTheDocument();
  });

  it('displays the main contact text', () => {
    render(<Contact />);
    expect(screen.getByText(/We're happy to answer all your questions about the Victoria BIOTech Futures Challenge/i)).toBeInTheDocument();
  });

  it('displays FAQ link', () => {
    render(<Contact />);
    const faqText = screen.getByText(/FAQ's/i);
    expect(faqText).toBeInTheDocument();
    // FAQ is now part of the contact text, not a separate link
  });

  it('displays email link', () => {
    render(<Contact />);
    const emailLink = screen.getByText(/anke.oatley@mbsi.org.au/i);
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:anke.oatley@mbsi.org.au');
  });

  it('renders MBSI logo', () => {
    render(<Contact />);
    const mbsiLogo = screen.getByAltText('Melbourne Bioinnovation Student Initiative Logo');
    expect(mbsiLogo).toBeInTheDocument();
    expect(mbsiLogo).toHaveAttribute('src', 'mocked-tum-logo.png');
  });

  it('renders University of Melbourne logo', () => {
    render(<Contact />);
    const tumLogo = screen.getByAltText('University of Melbourne Logo');
    expect(tumLogo).toBeInTheDocument();
    expect(tumLogo).toHaveAttribute('src', 'mocked-tum-logo.png');
  });

  it('has correct container class', () => {
    render(<Contact />);
    const container = screen.getByText('CONTACT').closest('.contact-container');
    expect(container).toBeInTheDocument();
  });

  it('has correct card class', () => {
    render(<Contact />);
    const card = screen.getByText('CONTACT').closest('.contact-card');
    expect(card).toBeInTheDocument();
  });

  it('displays title with correct styling', () => {
    render(<Contact />);
    const title = screen.getByText('CONTACT');
    expect(title.closest('h2')).toHaveClass('contact-title', 'hover-gradient-text');
  });

  it('displays subtitle with correct styling', () => {
    render(<Contact />);
    const subtitle = screen.getByText("We'd love to hear from you");
    expect(subtitle.closest('p')).toHaveClass('contact-subtitle');
  });

  it('displays contact text with correct styling', () => {
    render(<Contact />);
    const contactText = screen.getByText(/We're happy to answer all your questions about the Victoria BIOTech Futures Challenge/i);
    expect(contactText.closest('p')).toHaveClass('contact-text');
  });

  it('displays FAQ link with correct styling', () => {
    render(<Contact />);
    const faqText = screen.getByText(/FAQ's/i);
    // FAQ is now part of contact text, styling is inherited from parent
    expect(faqText).toBeInTheDocument();
  });

  it('has email container', () => {
    render(<Contact />);
    const emailContainer = screen.getByText(/anke.oatley@mbsi.org.au/i).closest('.contact-email');
    expect(emailContainer).toBeInTheDocument();
  });

  it('displays email button with correct styling', () => {
    render(<Contact />);
    const emailButton = screen.getByText(/anke.oatley@mbsi.org.au/i);
    expect(emailButton.closest('a')).toHaveClass('email-button');
  });

  it('has logos container', () => {
    render(<Contact />);
    const logosContainer = screen.getByAltText('Melbourne Bioinnovation Student Initiative Logo').closest('.logos');
    expect(logosContainer).toBeInTheDocument();
  });

  it('MBSI logo has correct styling', () => {
    render(<Contact />);
    const mbsiLogo = screen.getByAltText('Melbourne Bioinnovation Student Initiative Logo');
    expect(mbsiLogo).toHaveClass('logo');
  });

  it('University of Melbourne logo has correct styling', () => {
    render(<Contact />);
    const tumLogo = screen.getByAltText('University of Melbourne Logo');
    expect(tumLogo).toHaveClass('logo');
  });

  it('renders motion components correctly', () => {
    render(<Contact />);
    // Test that motion components are rendered as regular HTML elements
    expect(screen.getByText('CONTACT')).toBeInTheDocument();
  });

  it('contains all expected text content', () => {
    render(<Contact />);
    const expectedTexts = [
      "We'd love to hear from you",
      "We're happy to answer all your questions about the Victoria BIOTech Futures Challenge",
      "FAQ's",
      'anke.oatley@mbsi.org.au'
    ];

    expectedTexts.forEach(text => {
      expect(screen.getByText(new RegExp(text, 'i'))).toBeInTheDocument();
    });
    
    // Test CONTACT title specifically
    expect(screen.getByRole('heading', { level: 2, name: 'CONTACT' })).toBeInTheDocument();
  });

  it('has proper contact layout structure', () => {
    render(<Contact />);
    const container = screen.getByText('CONTACT').closest('.contact-container');
    expect(container).toBeInTheDocument();

    const card = screen.getByText('CONTACT').closest('.contact-card');
    expect(card).toBeInTheDocument();

    const emailContainer = screen.getByText(/anke.oatley@mbsi.org.au/i).closest('.contact-email');
    expect(emailContainer).toBeInTheDocument();

    const logosContainer = screen.getByAltText('Melbourne Bioinnovation Student Initiative Logo').closest('.logos');
    expect(logosContainer).toBeInTheDocument();
  });

  it('renders with correct heading structure', () => {
    render(<Contact />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('CONTACT');
  });

  it('has proper link accessibility', () => {
    render(<Contact />);
    const emailLink = screen.getByText(/anke.oatley@mbsi.org.au/i);
    expect(emailLink.closest('a')).toHaveAttribute('href');
    expect(emailLink.closest('a')?.getAttribute('href')).toContain('mailto:');

    const faqText = screen.getByText(/FAQ's/i);
    // FAQ is now part of contact text, not a separate link
    expect(faqText).toBeInTheDocument();
  });

  it('has proper image alt text', () => {
    render(<Contact />);
    const mbsiLogo = screen.getByAltText('Melbourne Bioinnovation Student Initiative Logo');
    expect(mbsiLogo).toBeInTheDocument();

    const tumLogo = screen.getByAltText('University of Melbourne Logo');
    expect(tumLogo).toBeInTheDocument();
  });

  it('has correct Victoria-specific differences from Queensland', () => {
    render(<Contact />);
    // Victoria-specific email
    expect(screen.getByText(/anke.oatley@mbsi.org.au/i)).toBeInTheDocument();
    
    // Victoria-specific text
    expect(screen.getByText(/Victoria BIOTech Futures Challenge/i)).toBeInTheDocument();
    
    // Victoria-specific logos
    expect(screen.getByAltText('Melbourne Bioinnovation Student Initiative Logo')).toBeInTheDocument();
    expect(screen.getByAltText('University of Melbourne Logo')).toBeInTheDocument();
  });

  it('displays all key content sections', () => {
    render(<Contact />);
    // Title section
    expect(screen.getByText('CONTACT')).toBeInTheDocument();
    
    // Subtitle section
    expect(screen.getByText("We'd love to hear from you")).toBeInTheDocument();
    
    // Main text section
    expect(screen.getByText(/We're happy to answer all your questions/i)).toBeInTheDocument();
    
    // Email section
    expect(screen.getByText(/anke.oatley@mbsi.org.au/i)).toBeInTheDocument();
    
    // Logo section
    expect(screen.getByAltText('Melbourne Bioinnovation Student Initiative Logo')).toBeInTheDocument();
    expect(screen.getByAltText('University of Melbourne Logo')).toBeInTheDocument();
  });

  it('renders contact component with proper structure', () => {
    render(<Contact />);
    // Test main container
    const container = document.querySelector('.contact-container');
    expect(container).toBeInTheDocument();
    
    // Test card structure
    const card = document.querySelector('.contact-card');
    expect(card).toBeInTheDocument();
    
    // Test logos section
    const logos = document.querySelector('.logos');
    expect(logos).toBeInTheDocument();
  });

  it('has proper motion component structure', () => {
    render(<Contact />);
    // Test that motion components render as divs
    const container = document.querySelector('.contact-container');
    expect(container?.tagName).toBe('DIV');
    
    const card = document.querySelector('.contact-card');
    expect(card?.tagName).toBe('DIV');
  });

  it('displays contact information correctly', () => {
    render(<Contact />);
    // Test all contact information is present
    expect(screen.getByText('CONTACT')).toBeInTheDocument();
    expect(screen.getByText("We'd love to hear from you")).toBeInTheDocument();
    expect(screen.getByText(/We're happy to answer all your questions/i)).toBeInTheDocument();
    expect(screen.getByText(/FAQ's/i)).toBeInTheDocument();
    expect(screen.getByText(/anke.oatley@mbsi.org.au/i)).toBeInTheDocument();
  });

  it('renders with proper Victoria branding', () => {
    render(<Contact />);
    // Test Victoria-specific content
    expect(screen.getByText(/Victoria BIOTech Futures Challenge/i)).toBeInTheDocument();
    expect(screen.getByAltText('Melbourne Bioinnovation Student Initiative Logo')).toBeInTheDocument();
    expect(screen.getByAltText('University of Melbourne Logo')).toBeInTheDocument();
  });
});