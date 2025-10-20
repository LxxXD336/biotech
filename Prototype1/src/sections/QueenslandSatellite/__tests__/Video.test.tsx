import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from '../Video';

describe('QueenslandSatellite Video Component', () => {
  beforeEach(() => {
    render(<VideoPlayer />);
  });

  it('renders the component without crashing', () => {
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the video introduction pill', () => {
    expect(screen.getByText('VIDEO')).toBeInTheDocument();
  });

  it('displays the main title', () => {
    expect(screen.getByText('BIOTECH FUTURES CHALLENGE')).toBeInTheDocument();
  });

  it('renders the YouTube iframe', () => {
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/5n-tM9Pv0cw');
  });

  it('has correct container class', () => {
    const container = screen.getByRole('banner');
    expect(container).toHaveClass('video-header');
  });

  it('has correct header structure', () => {
    const header = screen.getByText('VIDEO').closest('.video-header');
    expect(header).toBeInTheDocument();
  });

  it('has correct wrapper structure', () => {
    const wrapper = screen.getByTitle('YouTube video player').closest('.video-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('displays pill with correct styling', () => {
    const pill = screen.getByText('VIDEO');
    expect(pill.closest('.pill')).toBeInTheDocument();
  });

  it('displays title with correct styling', () => {
    const title = screen.getByText('BIOTECH FUTURES CHALLENGE');
    expect(title.closest('h1')).toHaveClass('page-title', 'hover-gradient-text');
  });

  it('renders iframe with correct attributes', () => {
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/5n-tM9Pv0cw');
    expect(iframe).toHaveAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    expect(iframe).toHaveAttribute('allowFullScreen');
  });

  it('has proper accessibility structure', () => {
    const section = screen.getByRole('banner');
    const heading = screen.getByRole('heading', { level: 1 });
    
    expect(section).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
  });

  it('renders motion components correctly', () => {
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('BIOTECH FUTURES CHALLENGE')).toBeInTheDocument();
  });

  it('contains all expected text content', () => {
    const expectedTexts = [
      'VIDEO',
      'BIOTECH FUTURES CHALLENGE'
    ];

    expectedTexts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('renders with correct layout structure', () => {
    const container = screen.getByRole('banner');
    expect(container).toHaveClass('video-header');
    
    const header = screen.getByText('VIDEO').closest('.video-header');
    expect(header).toBeInTheDocument();
    
    const wrapper = screen.getByTitle('YouTube video player').closest('.video-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('has proper iframe styling', () => {
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toBeInTheDocument();
    expect(iframe.tagName).toBe('IFRAME');
  });

  it('renders video wrapper with correct styling', () => {
    const wrapper = screen.getByTitle('YouTube video player').closest('.video-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders header with correct styling', () => {
    const header = screen.getByText('VIDEO').closest('.video-header');
    expect(header).toBeInTheDocument();
  });

  it('has proper YouTube embed URL', () => {
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/5n-tM9Pv0cw');
  });

  it('has proper iframe permissions', () => {
    const iframe = screen.getByTitle('YouTube video player');
    const allowAttribute = iframe.getAttribute('allow');
    expect(allowAttribute).toContain('accelerometer');
    expect(allowAttribute).toContain('autoplay');
    expect(allowAttribute).toContain('clipboard-write');
    expect(allowAttribute).toContain('encrypted-media');
    expect(allowAttribute).toContain('gyroscope');
    expect(allowAttribute).toContain('picture-in-picture');
    expect(allowAttribute).toContain('web-share');
  });

  it('renders fullscreen capability', () => {
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toHaveAttribute('allowFullScreen');
  });

  it('has proper container styling', () => {
    const container = screen.getByRole('banner');
    expect(container).toHaveClass('video-header');
  });

  it('renders motion elements correctly', () => {
    const container = screen.getByRole('banner');
    const header = screen.getByText('VIDEO').closest('.video-header');
    const wrapper = screen.getByTitle('YouTube video player').closest('.video-wrapper');
    
    expect(container).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(wrapper).toBeInTheDocument();
  });
});
