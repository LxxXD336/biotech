import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Mentors from '../Mentor';

// Mock all mentor images
jest.mock('../../QueenslandSatelliteResource/finja.png', () => 'mocked-finja.png');
jest.mock('../../QueenslandSatelliteResource/epari.png', () => 'mocked-epari.png');
jest.mock('../../QueenslandSatelliteResource/luke.png', () => 'mocked-luke.png');
jest.mock('../../QueenslandSatelliteResource/alireza.png', () => 'mocked-alireza.png');
jest.mock('../../QueenslandSatelliteResource/adi.png', () => 'mocked-adi.png');
jest.mock('../../QueenslandSatelliteResource/alyssa.png', () => 'mocked-alyssa.png');
jest.mock('../../QueenslandSatelliteResource/mikaela.png', () => 'mocked-mikaela.png');
jest.mock('../../QueenslandSatelliteResource/rohan.png', () => 'mocked-rohan.png');
jest.mock('../../QueenslandSatelliteResource/stephanie.png', () => 'mocked-stephanie.png');
jest.mock('../../QueenslandSatelliteResource/swathi.png', () => 'mocked-swathi.png');
jest.mock('../../QueenslandSatelliteResource/thayathini.png', () => 'mocked-thayathini.png');
jest.mock('../../QueenslandSatelliteResource/grace.png', () => 'mocked-grace.png');
jest.mock('../../QueenslandSatelliteResource/lewen.png', () => 'mocked-lewen.png');

describe('QueenslandSatellite Mentors Component', () => {
  beforeEach(() => {
    render(<Mentors />);
  });

  it('renders the component without crashing', () => {
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the mentors pill', () => {
    expect(screen.getByText('MENTORS')).toBeInTheDocument();
  });

  it('displays the main title', () => {
    expect(screen.getByText('MEET OUR 2025 MENTORS')).toBeInTheDocument();
  });

  it('displays the subtitle', () => {
    expect(screen.getByText('Click on each mentor to find out more')).toBeInTheDocument();
  });

  it('displays all mentor names', () => {
    const mentorNames = [
      'Finja Joerg',
      'Associate Professor Devakar Epari',
      'Luke Hipwood',
      'Alireza Mahavapoor',
      'Dr Adi Idris',
      'Alyssa Detterman',
      'Mikaela Westlake',
      'Rohan Mathias',
      'Stephanie Michelena Tupiza',
      'Swathi Jayaraman',
      'Thayathini Ayyachi',
      'Grace Wengjing Gao',
      'Lewen Holloway'
    ];

    mentorNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it('displays all mentor roles', () => {
    const mentorRoles = [
      'Industry, Galemics',
      'Associate Professor',
      'PhD Student',
      'Affiliate PhD',
      'Post-doctoral Research Fellow',
      'M.Sc. Student',
      'PhD Student',
      'Industry',
      'PhD Student',
      'MPhil Student',
      'PhD Student',
      'Postdoctoral Fellow',
      'PhD Student'
    ];

    mentorRoles.forEach(role => {
      const elements = screen.getAllByText(role);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('displays all mentor descriptions', () => {
    const mentorDescriptions = [
      'Biomaterial research and development',
      'Biomedical Engineering',
      'Biomaterial-based tissue engineering',
      'Biomechanical Engineering',
      'Viral immunology and antiviral therapies',
      'Medical Biotechnology',
      'Medical Engineering',
      'Mechatronics Engineer',
      'Tissue Engineering',
      'Biomedical/Medical Engineering',
      'Biomaterials Research',
      'siRNA Therapeutics for respiratory diseases',
      'Medical Engineering'
    ];

    mentorDescriptions.forEach(desc => {
      const elements = screen.getAllByText(desc);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('renders all mentor images', () => {
    const mentorImages = [
      'Finja Joerg',
      'Associate Professor Devakar Epari',
      'Luke Hipwood',
      'Alireza Mahavapoor',
      'Dr Adi Idris',
      'Alyssa Detterman',
      'Mikaela Westlake',
      'Rohan Mathias',
      'Stephanie Michelena Tupiza',
      'Swathi Jayaraman',
      'Thayathini Ayyachi',
      'Grace Wengjing Gao',
      'Lewen Holloway'
    ];

    mentorImages.forEach(name => {
      const image = screen.getByAltText(name);
      expect(image).toBeInTheDocument();
    });
  });

  it('has correct section class', () => {
    const section = document.querySelector('#mentors');
    expect(section).toHaveClass('mentors-section');
  });

  it('has correct container structure', () => {
    const container = screen.getByText('MENTORS').closest('.btf-container');
    expect(container).toBeInTheDocument();
  });

  it('displays pill with correct styling', () => {
    const pill = screen.getByText('MENTORS');
    expect(pill.closest('.pill')).toBeInTheDocument();
  });

  it('displays title with correct styling', () => {
    const title = screen.getByText('MEET OUR 2025 MENTORS');
    expect(title.closest('h2')).toHaveClass('mentor-title', 'hover-gradient-text');
  });

  it('displays subtitle with correct styling', () => {
    const subtitle = screen.getByText('Click on each mentor to find out more');
    expect(subtitle.closest('p')).toHaveClass('mentor-sub-title');
  });

  it('renders mentor grid', () => {
    const grid = screen.getByText('Finja Joerg').closest('.mentor-grid');
    expect(grid).toBeInTheDocument();
  });

  it('renders mentor card wrappers', () => {
    const cardWrappers = document.querySelectorAll('.mentor-card-wrapper');
    expect(cardWrappers).toHaveLength(13);
  });

  it('renders mentor cards', () => {
    const mentorCards = document.querySelectorAll('.mentor-card');
    expect(mentorCards).toHaveLength(13);
  });

  it('renders mentor image containers', () => {
    const imageContainers = document.querySelectorAll('.mentor-img-container');
    expect(imageContainers).toHaveLength(13);
  });

  it('displays mentor names with correct styling', () => {
    const mentorNames = document.querySelectorAll('.mentor-gradient-text');
    expect(mentorNames).toHaveLength(13);
  });

  it('displays mentor roles with correct styling', () => {
    const mentorRoles = document.querySelectorAll('.mentor-role');
    expect(mentorRoles).toHaveLength(13);
  });

  it('displays mentor descriptions with correct styling', () => {
    const mentorDescriptions = document.querySelectorAll('.mentor-desc');
    expect(mentorDescriptions).toHaveLength(13);
  });

  it('has proper accessibility structure', () => {
    const section = screen.getByRole('banner');
    const heading = screen.getByRole('heading', { level: 2 });
    
    expect(section).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
  });

  it('renders motion components correctly', () => {
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('MEET OUR 2025 MENTORS')).toBeInTheDocument();
  });

  it('contains all expected text content', () => {
    const expectedTexts = [
      'MENTORS',
      'MEET OUR 2025 MENTORS',
      'Click on each mentor to find out more',
      'Finja Joerg',
      'Associate Professor Devakar Epari',
      'Luke Hipwood',
      'Alireza Mahavapoor',
      'Dr Adi Idris',
      'Alyssa Detterman',
      'Mikaela Westlake',
      'Rohan Mathias',
      'Stephanie Michelena Tupiza',
      'Swathi Jayaraman',
      'Thayathini Ayyachi',
      'Grace Wengjing Gao',
      'Lewen Holloway'
    ];

    expectedTexts.forEach(text => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('renders mentor links correctly', () => {
    const mentorLinks = screen.getAllByRole('link');
    expect(mentorLinks).toHaveLength(13);
    
    // Check first mentor link
    const firstLink = mentorLinks[0];
    expect(firstLink).toHaveAttribute('href', 'https://www.linkedin.com/in/finja-joerg-672237248/?utm_source=share&original_referer=&utm_content=profil&utm_campaign=share_via&utm_medium=member_mweb&originalSubdomain=au');
  });

  it('has proper image attributes', () => {
    const image = screen.getByAltText('Finja Joerg');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mocked-lewen.png');
  });

  it('renders with correct layout structure', () => {
    const section = document.querySelector('#mentors');
    expect(section).toHaveClass('mentors-section');
    
    const container = screen.getByText('MENTORS').closest('.btf-container');
    expect(container).toBeInTheDocument();
    
    const grid = screen.getByText('Finja Joerg').closest('.mentor-grid');
    expect(grid).toBeInTheDocument();
  });

  it('renders animated background', () => {
    const animatedBg = screen.getByText('MENTORS').closest('.mentors-section')?.querySelector('.animated-bg');
    expect(animatedBg).toBeInTheDocument();
  });

  it('renders mentor header', () => {
    const header = screen.getByText('MENTORS').closest('.mentor-header');
    expect(header).toBeInTheDocument();
  });

  it('renders pill wrapper', () => {
    const pillWrapper = screen.getByText('MENTORS').closest('.pill-wrapper');
    expect(pillWrapper).toBeInTheDocument();
  });
});
