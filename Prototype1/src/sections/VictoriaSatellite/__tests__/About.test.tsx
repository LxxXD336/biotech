import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import About from '../About';

// Mock the image import
jest.mock('../../VictoriaSatelliteResource/About.png', () => 'mocked-vic-about-image.png');

describe('VictoriaSatellite About Component', () => {
  beforeEach(() => {
    render(<About />);
  });

  it('renders the component without crashing', () => {
    expect(document.querySelector('.about-section')).toBeInTheDocument();
  });

  it('displays the VIC CHALLENGE pill', () => {
    expect(screen.getByText('VIC CHALLENGE')).toBeInTheDocument();
  });

  it('displays the main title', () => {
    expect(screen.getByText('ABOUT THE VIC CHALLENGE')).toBeInTheDocument();
  });

  it('renders the about image', () => {
    const image = screen.getByAltText('About Victoria Challenge');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mocked-vic-about-image.png');
  });

  it('displays the "Read More" link', () => {
    const readMoreLink = screen.getByText('Read More >');
    expect(readMoreLink).toBeInTheDocument();
    expect(readMoreLink).toHaveAttribute('href', 'https://www.mbsi.org.au/about-us');
    expect(readMoreLink).toHaveAttribute('target', '_blank');
    expect(readMoreLink).toHaveAttribute('rel', 'noreferrer');
  });

  it('displays all three cards', () => {
    expect(screen.getByText('VIC Challenge Overview')).toBeInTheDocument();
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText('Our Membership')).toBeInTheDocument();
  });

  it('displays card icons', () => {
    expect(screen.getByText('🏆')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('displays card content with links', () => {
    expect(screen.getByText(/Melbourne Bioinnovation Student Initiative/i)).toBeInTheDocument();
    expect(screen.getAllByText(/MBSI/i)).toHaveLength(4);
    expect(screen.getByText(/Graeme Clarke Institute for Biomedical Engineering/i)).toBeInTheDocument();
  });

  it('has correct section class', () => {
    const section = document.querySelector('.about-section');
    expect(section).toHaveClass('about-section');
  });

  it('has correct layout structure', () => {
    const layout = screen.getByText('ABOUT THE VIC CHALLENGE').closest('.about-layout');
    expect(layout).toBeInTheDocument();
  });

  it('has correct left section structure', () => {
    const leftSection = screen.getByText('ABOUT THE VIC CHALLENGE').closest('.about-left');
    expect(leftSection).toBeInTheDocument();
  });

  it('has correct cards section structure', () => {
    const cardsSection = screen.getByText('VIC Challenge Overview').closest('.about-cards');
    expect(cardsSection).toBeInTheDocument();
  });

  it('displays pill with correct styling', () => {
    const pill = screen.getByText('VIC CHALLENGE');
    expect(pill.closest('.pill')).toBeInTheDocument();
  });

  it('displays title with correct styling', () => {
    const title = screen.getByText('ABOUT THE VIC CHALLENGE');
    expect(title.closest('h2')).toHaveClass('about-title', 'hover-gradient-text');
  });

  it('displays image with correct styling', () => {
    const image = screen.getByAltText('About Victoria Challenge');
    expect(image).toHaveClass('about-image');
  });

  it('displays read more button with correct styling', () => {
    const readMoreBtn = screen.getByText('Read More >');
    expect(readMoreBtn).toHaveClass('about-readmore-btn');
  });

  it('displays cards with correct gradient classes', () => {
    const overviewCard = screen.getByText('VIC Challenge Overview').closest('.about-card');
    const missionCard = screen.getByText('Our Mission').closest('.about-card');
    const membershipCard = screen.getByText('Our Membership').closest('.about-card');
    
    expect(overviewCard).toHaveClass('about-gradient1');
    expect(missionCard).toHaveClass('about-gradient2');
    expect(membershipCard).toHaveClass('about-gradient3');
  });

  it('displays card titles with correct styling', () => {
    const cardTitles = document.querySelectorAll('.about-card-title');
    expect(cardTitles).toHaveLength(3);
  });

  it('displays card icons with correct styling', () => {
    const cardIcons = document.querySelectorAll('.about-card-icon');
    expect(cardIcons).toHaveLength(3);
  });

  it('displays card content with correct styling', () => {
    const cardContents = document.querySelectorAll('.about-card-content');
    expect(cardContents).toHaveLength(3);
  });

  it('displays show more/less buttons', () => {
    const showMoreButtons = screen.getAllByText(/Show More|Show Less/);
    expect(showMoreButtons).toHaveLength(3);
  });

  it('toggles card expansion when show more button is clicked', () => {
    const showMoreButtons = screen.getAllByText('Show More ▼');
    const firstButton = showMoreButtons[0];
    
    fireEvent.click(firstButton);
    
    expect(screen.getByText('Show Less ▲')).toBeInTheDocument();
  });

  it('toggles card expansion back when show less button is clicked', () => {
    const showMoreButtons = screen.getAllByText('Show More ▼');
    const firstButton = showMoreButtons[0];
    
    // Click to expand
    fireEvent.click(firstButton);
    expect(screen.getByText('Show Less ▲')).toBeInTheDocument();
    
    // Click to collapse
    const showLessButton = screen.getByText('Show Less ▲');
    fireEvent.click(showLessButton);
    expect(screen.getAllByText('Show More ▼')).toHaveLength(3);
  });

  it('displays extra content when expanded', () => {
    const showMoreButtons = screen.getAllByText('Show More ▼');
    const firstButton = showMoreButtons[0];
    
    fireEvent.click(firstButton);
    
    const extraContent = screen.getByText(/Registration for the VIC challenge will open from June 5th/i);
    expect(extraContent).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    const section = document.querySelector('.about-section');
    const heading = screen.getByRole('heading', { level: 2 });
    
    expect(section).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
  });

  it('renders motion components correctly', () => {
    expect(document.querySelector('.about-section')).toBeInTheDocument();
    expect(screen.getByText('ABOUT THE VIC CHALLENGE')).toBeInTheDocument();
  });

  it('contains all expected text content', () => {
    const expectedTexts = [
      'VIC CHALLENGE',
      'ABOUT THE VIC CHALLENGE',
      'VIC Challenge Overview',
      'Our Mission',
      'Our Membership',
      'Melbourne Bioinnovation Student Initiative',
      'MBSI',
      'Graeme Clarke Institute for Biomedical Engineering',
      'Read More >'
    ];

    expectedTexts.forEach(text => {
      if (text === 'MBSI') {
        expect(screen.getAllByText(new RegExp(text, 'i'))).toHaveLength(4);
      } else if (text === 'VIC CHALLENGE') {
        expect(screen.getAllByText(new RegExp(text, 'i'))).toHaveLength(4);
      } else {
        expect(screen.getByText(new RegExp(text, 'i'))).toBeInTheDocument();
      }
    });
  });

  it('has proper image attributes', () => {
    const image = screen.getByAltText('About Victoria Challenge');
    expect(image).toHaveAttribute('src', 'mocked-vic-about-image.png');
    expect(image).toHaveClass('about-image');
  });

  it('has proper link attributes', () => {
    const readMoreLink = screen.getByText('Read More >');
    expect(readMoreLink).toHaveAttribute('href', 'https://www.mbsi.org.au/about-us');
    expect(readMoreLink).toHaveAttribute('target', '_blank');
    expect(readMoreLink).toHaveAttribute('rel', 'noreferrer');
  });

  it('displays Victoria-specific content', () => {
    expect(screen.getByText(/VIC Challenge Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Melbourne Bioinnovation Student Initiative/i)).toBeInTheDocument();
    expect(screen.getAllByText(/MBSI/i)).toHaveLength(4);
  });

  it('renders with correct layout structure', () => {
    const section = document.querySelector('.about-section');
    expect(section).toHaveClass('about-section');
    
    const layout = screen.getByText('ABOUT THE VIC CHALLENGE').closest('.about-layout');
    expect(layout).toBeInTheDocument();
  });

  it('has proper card structure', () => {
    const cards = document.querySelectorAll('.about-card');
    expect(cards).toHaveLength(3);
    
    cards.forEach(card => {
      expect(card).toBeInTheDocument();
    });
  });

  it('renders motion elements correctly', () => {
    const section = document.querySelector('.about-section');
    const leftSection = screen.getByText('ABOUT THE VIC CHALLENGE').closest('.about-left');
    const cardsSection = screen.getByText('VIC Challenge Overview').closest('.about-cards');
    
    expect(section).toBeInTheDocument();
    expect(leftSection).toBeInTheDocument();
    expect(cardsSection).toBeInTheDocument();
  });

  it('displays correct card content', () => {
    expect(screen.getByText(/Melbourne Bioinnovation Student Initiative/i)).toBeInTheDocument();
    expect(screen.getByText(/MBSI is lead by a group of undergraduate/i)).toBeInTheDocument();
    expect(screen.getByText(/Membership in MBSI is free and open to all/i)).toBeInTheDocument();
  });

  it('has proper gradient styling', () => {
    const overviewCard = screen.getByText('VIC Challenge Overview').closest('.about-card');
    const missionCard = screen.getByText('Our Mission').closest('.about-card');
    const membershipCard = screen.getByText('Our Membership').closest('.about-card');
    
    expect(overviewCard).toHaveClass('about-gradient1');
    expect(missionCard).toHaveClass('about-gradient2');
    expect(membershipCard).toHaveClass('about-gradient3');
  });
});
