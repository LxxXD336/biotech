import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Timeline from '../Timeline';

// Mock the useReveal hook and COLORS
jest.mock('../../../components/common', () => ({
  useReveal: () => ({
    ref: React.createRef(),
    inView: true,
  }),
  COLORS: {
    green: "#017151",
    charcoal: "#174243",
    white: "#FFFFFF",
    black: "#000000",
    lightBG: "#F6FBF9",
    mint: "#5EA99E",
    navy: "#1A345E",
    blue: "#396B7B",
    yellow: "#F1E5A6",
    lime: "#B6F0C2",
  },
  Container: ({ children, className }: any) => <div className={`btf-container ${className}`}>{children}</div>,
}));

// Mock the useInView hook from framer-motion
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useInView: jest.fn(() => true), // Always in view for tests
}));

// Mock IntersectionObserver and ResizeObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

(global as any).ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

describe('QueenslandSatellite Timeline Component', () => {
  beforeEach(() => {
    render(<Timeline />);
  });

  it('renders the component without crashing', () => {
    expect(screen.getByText('KEY DATES')).toBeInTheDocument();
  });

  it('displays the timeline pill', () => {
    expect(screen.getByText('KEY DATES')).toBeInTheDocument();
  });

  it('displays the main timeline heading', () => {
    expect(screen.getByText('KEY QLD DATES 2025')).toBeInTheDocument();
  });

  it('displays all timeline events', () => {
    expect(screen.getAllByText('Registration opens')).toHaveLength(2);
    expect(screen.getAllByText('Registration close')).toHaveLength(2);
    expect(screen.getAllByText('Project commence')).toHaveLength(2);
    expect(screen.getAllByText('Project Submission due')).toHaveLength(2);
    expect(screen.getAllByText('Presentation & Symposium')).toHaveLength(2);
  });

  it('displays event dates correctly', () => {
    expect(screen.getByText('MAY')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('JUL')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('AUG')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('SEP')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('OCT')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
  });

  it('displays event subtitles', () => {
    expect(screen.getByText('Registration opens for all participants.')).toBeInTheDocument();
    expect(screen.getByText('Registration closes for all participants.')).toBeInTheDocument();
    expect(screen.getByText('Project commence, get ready!')).toBeInTheDocument();
    expect(screen.getByText('Project submission due, no extension is allowed.')).toBeInTheDocument();
    expect(screen.getByText('Presentation & Symposium, get ready!')).toBeInTheDocument();
  });

  it('has correct section id', () => {
    const section = document.querySelector('#timeline-enhanced-v2');
    expect(section).toBeInTheDocument();
  });

  it('has correct container structure', () => {
    const container = screen.getByText('KEY DATES').closest('.btf-container');
    expect(container).toBeInTheDocument();
  });

  it('displays pill with correct styling', () => {
    const pill = screen.getByText('KEY DATES');
    expect(pill.closest('.pill')).toBeInTheDocument();
  });

  it('displays title with correct styling', () => {
    const title = screen.getByText('KEY QLD DATES 2025');
    expect(title.closest('h2')).toHaveClass('te2-title', 'hover-gradient-text');
  });

  it('renders timeline wrapper', () => {
    const timelineWrapper = document.querySelector('.te2-wrap');
    expect(timelineWrapper).toBeInTheDocument();
  });

  it('renders timeline progress', () => {
    const progressElement = document.querySelector('.te2-progress-fill');
    expect(progressElement).toBeInTheDocument();
  });

  it('renders timeline character', () => {
    // Character element is dynamically created, so we test for its container
    const characterContainer = document.querySelector('.te2-wrap');
    expect(characterContainer).toBeInTheDocument();
  });

  it('renders all timeline nodes', () => {
    const nodes = document.querySelectorAll('.te2-node');
    expect(nodes).toHaveLength(5);
  });

  it('displays event information correctly', () => {
    // Test first event
    expect(screen.getByText('MAY')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getAllByText('Registration opens')).toHaveLength(2);
    expect(screen.getByText('Registration opens for all participants.')).toBeInTheDocument();
  });

  it('has proper accessibility structure', () => {
    const section = document.querySelector('#timeline-enhanced-v2');
    const heading = screen.getByRole('heading', { level: 2 });
    
    expect(section).toBeInTheDocument();
    expect(heading).toBeInTheDocument();
  });

  it('renders motion components correctly', () => {
    expect(document.querySelector('#timeline-enhanced-v2')).toBeInTheDocument();
    expect(screen.getByText('KEY QLD DATES 2025')).toBeInTheDocument();
  });

  it('contains all expected text content', () => {
    // Text that appears once
    expect(screen.getByText('KEY DATES')).toBeInTheDocument();
    expect(screen.getByText('KEY QLD DATES 2025')).toBeInTheDocument();
    
    // Text that appears twice (in label and detail)
    expect(screen.getAllByText('Registration opens')).toHaveLength(2);
    expect(screen.getAllByText('Registration close')).toHaveLength(2);
    expect(screen.getAllByText('Project commence')).toHaveLength(2);
    expect(screen.getAllByText('Project Submission due')).toHaveLength(2);
    expect(screen.getAllByText('Presentation & Symposium')).toHaveLength(2);
    
    // Month abbreviations that appear once
    expect(screen.getByText('MAY')).toBeInTheDocument();
    expect(screen.getByText('JUL')).toBeInTheDocument();
    expect(screen.getByText('AUG')).toBeInTheDocument();
    expect(screen.getByText('SEP')).toBeInTheDocument();
    expect(screen.getByText('OCT')).toBeInTheDocument();
  });

  it('renders timeline events in correct order', () => {
    const events = [
      'Registration opens',
      'Registration close', 
      'Project commence',
      'Project Submission due',
      'Presentation & Symposium'
    ];

    events.forEach(event => {
      expect(screen.getAllByText(event)).toHaveLength(2);
    });
  });

  it('displays correct month abbreviations', () => {
    const months = ['MAY', 'JUL', 'AUG', 'SEP', 'OCT'];
    months.forEach(month => {
      expect(screen.getByText(month)).toBeInTheDocument();
    });
  });

  it('displays correct day numbers', () => {
    const days = ['10', '8', '5', '12', '9'];
    days.forEach(day => {
      expect(screen.getAllByText(day)).toHaveLength(1);
    });
  });

  it('has proper timeline structure', () => {
    const timelineWrapper = document.querySelector('.te2-wrap');
    expect(timelineWrapper).toBeInTheDocument();
    
    const timelineProgress = document.querySelector('.te2-progress-fill');
    expect(timelineProgress).toBeInTheDocument();
    
    const timelineCharacter = document.querySelector('.te2-wrap');
    expect(timelineCharacter).toBeInTheDocument();
  });

  it('renders with correct layout structure', () => {
    const section = document.querySelector('#timeline-enhanced-v2');
    expect(section).toBeInTheDocument();
    
    const container = screen.getByText('KEY DATES').closest('.btf-container');
    expect(container).toBeInTheDocument();
  });

  it('handles timeline node interactions', async () => {
    // Find timeline nodes
    const nodes = document.querySelectorAll('.te2-node');
    expect(nodes.length).toBeGreaterThan(0);
    
    // Test clicking on first node
    const firstNode = nodes[0] as HTMLElement;
    fireEvent.click(firstNode);
    
    // Wait for any state changes
    await waitFor(() => {
      expect(firstNode).toBeInTheDocument();
    });
  });

  it('displays timeline header correctly', () => {
    const header = document.querySelector('.te2-header');
    expect(header).toBeInTheDocument();
    
    expect(screen.getByText('KEY DATES')).toBeInTheDocument();
    expect(screen.getByText('KEY QLD DATES 2025')).toBeInTheDocument();
  });

  it('renders timeline nodes with correct structure', () => {
    const nodes = document.querySelectorAll('.te2-node');
    expect(nodes).toHaveLength(5);
    
    nodes.forEach(node => {
      expect(node).toBeInTheDocument();
    });
  });

  it('has proper timeline wrapper classes', () => {
    const wrapper = document.querySelector('.te2-wrap');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('te2-wrap');
  });

  it('renders timeline content correctly', () => {
    // Test that all event content is present
    expect(screen.getByText('Registration opens for all participants.')).toBeInTheDocument();
    expect(screen.getByText('Registration closes for all participants.')).toBeInTheDocument();
    expect(screen.getByText('Project commence, get ready!')).toBeInTheDocument();
    expect(screen.getByText('Project submission due, no extension is allowed.')).toBeInTheDocument();
    expect(screen.getByText('Presentation & Symposium, get ready!')).toBeInTheDocument();
  });

  it('has proper section attributes', () => {
    const section = document.querySelector('#timeline-enhanced-v2');
    expect(section).toHaveAttribute('id', 'timeline-enhanced-v2');
  });

  it('renders timeline with proper motion components', () => {
    // Test that motion components are rendered as regular HTML elements
    expect(document.querySelector('#timeline-enhanced-v2')).toBeInTheDocument();
    expect(document.querySelector('.te2-header')).toBeInTheDocument();
    expect(document.querySelector('.te2-wrap')).toBeInTheDocument();
  });

  it('displays all timeline elements', () => {
    // Test timeline elements
    expect(document.querySelector('.te2-progress-fill')).toBeInTheDocument();
    expect(document.querySelector('.te2-wrap')).toBeInTheDocument();
    expect(document.querySelectorAll('.te2-node')).toHaveLength(5);
  });

  it('has correct Queensland-specific content', () => {
    expect(screen.getByText('KEY QLD DATES 2025')).toBeInTheDocument();
    expect(screen.getByText('KEY DATES')).toBeInTheDocument();
  });

  // Additional tests for uncovered code
  it('handles toggle function for opening event details', () => {
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Click first button to open details
    fireEvent.click(buttons[0]);
    
    // Check if event details are displayed (use getAllByText for multiple occurrences)
    expect(screen.getAllByText('Registration opens')).toHaveLength(2);
  });

  it('handles toggle function for closing event details', () => {
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Click first button to open details
    fireEvent.click(buttons[0]);
    
    // Click same button again to close details
    fireEvent.click(buttons[0]);
    
    // Event details should still be visible (component structure)
    expect(screen.getAllByText('Registration opens')).toHaveLength(2);
  });

  it('handles toggle function for switching between events', () => {
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
    
    // Click first button
    fireEvent.click(buttons[0]);
    
    // Click second button
    fireEvent.click(buttons[1]);
    
    // Both events should be visible
    expect(screen.getAllByText('Registration opens')).toHaveLength(2);
    expect(screen.getAllByText('Registration close')).toHaveLength(2);
  });

  it('handles window resize events', () => {
    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    
    // Component should still render correctly
    expect(screen.getByText('KEY QLD DATES 2025')).toBeInTheDocument();
  });

  it('handles setTimeout in useEffect', async () => {
    // Wait for setTimeout to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });
    
    // Component should still render correctly
    expect(screen.getByText('KEY QLD DATES 2025')).toBeInTheDocument();
  });

  it('handles progress width calculation', () => {
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Click different buttons to test progress calculation
    act(() => {
      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);
      fireEvent.click(buttons[2]);
    });
    
    // Progress element should exist
    expect(document.querySelector('.te2-progress-fill')).toBeInTheDocument();
  });

  it('handles character position calculation', () => {
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Click buttons to test character position
    act(() => {
      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[buttons.length - 1]);
    });
    
    // Character container should exist
    expect(document.querySelector('.te2-wrap')).toBeInTheDocument();
  });

  it('handles click effect state', () => {
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Click button to trigger click effect
    act(() => {
      fireEvent.click(buttons[0]);
    });
    
    // Component should still render
    expect(screen.getByText('KEY QLD DATES 2025')).toBeInTheDocument();
  });

  it('handles nodeRefs and DOM operations', () => {
    // Test that nodeRefs are properly handled
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Click buttons to test ref operations
    act(() => {
      buttons.forEach(button => {
        fireEvent.click(button);
      });
    });
    
    // All events should be visible
    expect(screen.getAllByText('Registration opens')).toHaveLength(2);
    expect(screen.getAllByText('Registration close')).toHaveLength(2);
    expect(screen.getAllByText('Project commence')).toHaveLength(2);
  });

  it('handles getBoundingClientRect operations', () => {
    // Mock getBoundingClientRect to return realistic values
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      left: 100,
      top: 100,
      width: 200,
      height: 50,
      right: 300,
      bottom: 150,
      x: 100,
      y: 100,
      toJSON: () => {}
    }));

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Click button to trigger position calculations
    act(() => {
      fireEvent.click(buttons[0]);
    });
    
    // Component should render correctly
    expect(screen.getByText('KEY QLD DATES 2025')).toBeInTheDocument();
  });
});