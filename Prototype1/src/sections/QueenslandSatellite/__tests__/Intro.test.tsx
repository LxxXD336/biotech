import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Intro from '../Intro';

// Mock the image import
jest.mock('../../QueenslandSatelliteResource/Intro.png', () => 'mocked-intro-image.png');

describe('QueenslandSatellite Intro Component', () => {
  beforeEach(() => {
    render(<Intro />);
  });

  it('renders the component without crashing', () => {
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the introduction pill text', () => {
    expect(screen.getByText('INTRODUCTION')).toBeInTheDocument();
  });

  it('displays the main title for Queensland students', () => {
    expect(screen.getByText(/Are You A Student.*From Queensland/i)).toBeInTheDocument();
  });

  it('displays the "Come and Join us" subtitle', () => {
    expect(screen.getByText('Come and Join us')).toBeInTheDocument();
  });

  it('displays the main content text about Queensland Satellite Chapter', () => {
    expect(screen.getByText(/After the success of our Queensland Satellite Chapter in 2023/i)).toBeInTheDocument();
  });

  it('displays information about QLD challenge timing', () => {
    expect(screen.getByText(/Please note the QLD challenge will take place/i)).toBeInTheDocument();
    expect(screen.getByText(/the NSW challenge/i)).toBeInTheDocument();
  });

  it('displays information about flying to Sydney', () => {
    expect(screen.getByText(/fly to Sydney/i)).toBeInTheDocument();
    expect(screen.getByText(/to present at the Sydney Symposium/i)).toBeInTheDocument();
  });

  it('renders the intro image', () => {
    const image = screen.getByAltText('Queensland Intro');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mocked-intro-image.png');
  });

  it('has correct section id', () => {
    const section = document.querySelector('#queensland');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'queensland');
  });

  it('has correct CSS classes applied', () => {
    const section = document.querySelector('#queensland');
    expect(section).toHaveClass('intro-section');
  });

  it('displays the pill with correct styling class', () => {
    const pill = screen.getByText('INTRODUCTION');
    expect(pill.closest('.pill')).toBeInTheDocument();
  });

  it('displays the title with correct gradient classes', () => {
    const title = screen.getByText(/Are You A Student.*From Queensland/i);
    expect(title.closest('h3')).toHaveClass('qld-card-title', 'gradient-text', 'hover-gradient-text');
  });

  it('displays the card with correct glass card styling', () => {
    const card = screen.getByText('Come and Join us').closest('div');
    expect(card).toHaveClass('qld-card', 'glass-card');
  });

  it('displays the subtitle with correct styling', () => {
    const subtitle = screen.getByText('Come and Join us');
    expect(subtitle.closest('h4')).toHaveClass('qld-card-subtitle');
  });

  it('displays the text content with correct styling', () => {
    const textElements = document.querySelectorAll('.qld-card-text');
    expect(textElements.length).toBeGreaterThan(0);
  });

  it('renders motion components correctly', () => {
    // Test that motion components are rendered as regular HTML elements
    expect(document.querySelector('#queensland')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    const header = screen.getByRole('banner');
    const heading = screen.getByRole('heading', { level: 3 });
    
    expect(header).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
  });

  it('contains all expected text content', () => {
    const expectedTexts = [
      'INTRODUCTION',
      'Are You A Student',
      'From Queensland',
      'Come and Join us',
      'Queensland Satellite Chapter',
      'BIOTech Futures Challenge',
      'QLD challenge',
      'NSW challenge',
      'fly to Sydney',
      'Sydney Symposium'
    ];

    expectedTexts.forEach(text => {
      expect(screen.getByText(new RegExp(text, 'i'))).toBeInTheDocument();
    });
  });

  it('has proper image attributes', () => {
    const image = screen.getByAltText('Queensland Intro');
    expect(image).toHaveAttribute('src', 'mocked-intro-image.png');
    expect(image).toHaveClass('intro-image');
  });

  it('renders with correct layout structure', () => {
    const introContent = screen.getByText('Come and Join us').closest('.intro-content');
    expect(introContent).toBeInTheDocument();
  });
});
