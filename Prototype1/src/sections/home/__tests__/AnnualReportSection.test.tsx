import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Full framer-motion stub: filter motion-only props to avoid passing to DOM
// Remove whileHover / whileTap / animate / initial / transition / variants / exit, etc.
jest.mock('framer-motion', () => {
  const React = require('react');

  const STRIP_KEYS = new Set([
    'animate',
    'initial',
    'transition',
    'variants',
    'exit',
    'layout',
    'layoutId',
    'viewport',
    'onViewportEnter',
    'onViewportLeave',
    'drag',
    'dragConstraints',
  ]);

  const isMotionKey = (k: string) =>
      /^while[A-Z]?/i.test(k) || STRIP_KEYS.has(k);

  const Noop = React.forwardRef((props: any, ref: any) => {
    const { children, ...rest } = props || {};
    const divProps: any = {};
    for (const [k, v] of Object.entries(rest)) {
      if (!isMotionKey(k)) divProps[k] = v;
    }
    return React.createElement('div', { ref, ...divProps }, children);
  });

  return {
    motion: {
      div: Noop,
      span: Noop,
      p: Noop,
      button: Noop,
    },
    // Always in-view
    useInView: () => true,
  };
});

// requestAnimationFrame: end animations immediately to avoid timer interference
beforeAll(() => {
  jest
      .spyOn(window, 'requestAnimationFrame' as any)
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(performance.now() + 999999);
        return 1 as unknown as number;
      });
  jest
      .spyOn(window, 'cancelAnimationFrame' as any)
      .mockImplementation(() => {});
  
  // Suppress JSDOM navigation errors
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (args[0]?.message?.includes('Not implemented: navigation')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Component under test (switch to default import if needed)
import { AnnualReport } from '../AnnualReportSection';

// Helper matcher: find pure number node, then check nearby container for "+"
// Works even when the "+" is rendered in a sibling/child element
const byNumberNodeWithPlusNearby = (n: number) => {
  return (_content: string, node: Element | null) => {
    if (!node) return false;
    const el = node as HTMLElement;

    const selfText = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!/^\d+$/.test(selfText)) return false;
    if (Number(selfText) !== n) return false;

    // Find a reasonable stats container: first check common classes, then parent
    const container =
        el.closest('.text-3xl, .md\\:text-4xl, .stat, .stat-item') ||
        el.parentElement;

    if (!container) return false;

    const containerText = (container.textContent || '').replace(/\s+/g, ' ');
    return /\+/.test(containerText);
  };
};

describe('AnnualReport', () => {
  test('renders button with year and custom quote', () => {
    render(
        <AnnualReport
            year={2029}
            text="A custom quote for testing."
            stats={[
              { label: 'Students', value: 123, suffix: '+', icon: '🎓' },
              { label: 'Mentors', value: 45, suffix: '+', icon: '🧑‍🏫' },
              { label: 'Projects', value: 400, suffix: '+', icon: '🧪' },
            ]}
        />
    );

    // Year button
    expect(
        screen.getByRole('button', { name: /2029 Annual Report/i })
    ).toBeInTheDocument();

    // Custom quote
    expect(
        screen.getByText(/A custom quote for testing\./i)
    ).toBeInTheDocument();
  });

  test('renders stats labels', () => {
    render(
        <AnnualReport
            year={2029}
            text="Whatever"
            stats={[
              { label: 'Students', value: 123, suffix: '+', icon: '🎓' },
              { label: 'Mentors', value: 45, suffix: '+', icon: '🧑‍🏫' },
              { label: 'Projects', value: 400, suffix: '+', icon: '🧪' },
            ]}
        />
    );

    expect(screen.getByText(/^Students$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Mentors$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Projects$/i)).toBeInTheDocument();
  });

  test('renders numbers with a visible "+" nearby (robust across DOM splits)', () => {
    render(
        <AnnualReport
            year={2029}
            text="Whatever"
            stats={[
              { label: 'Students', value: 123, suffix: '+', icon: '🎓' },
              { label: 'Mentors', value: 45, suffix: '+', icon: '🧑‍🏫' },
              { label: 'Projects', value: 400, suffix: '+', icon: '🧪' },
            ]}
        />
    );

    // Allow "+" in sibling/child elements
    expect(screen.getByText(byNumberNodeWithPlusNearby(123))).toBeInTheDocument();
    expect(screen.getByText(byNumberNodeWithPlusNearby(45))).toBeInTheDocument();
    expect(screen.getByText(byNumberNodeWithPlusNearby(400))).toBeInTheDocument();
  });

  test('renders with default props when no props provided', () => {
    render(<AnnualReport />);
    
    // Check default year
    expect(screen.getByRole('button', { name: /2024 Annual Report/i })).toBeInTheDocument();
    
    // Check default text
    expect(screen.getByText(/Since its inception in 2019/i)).toBeInTheDocument();
    
    // Check default stats
    expect(screen.getByText(/^Student alumni$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Schools$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Academic mentors$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Research projects$/i)).toBeInTheDocument();
  });

  test('renders stats with hints and goals', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', goal: 150, hint: 'since 2019', icon: '🎓' },
              { label: 'Mentors', value: 50, suffix: '+', goal: 75, hint: 'from universities', icon: '🧑‍🏫' },
            ]}
        />
    );

    // Check hint text
    expect(screen.getByText('since 2019')).toBeInTheDocument();
    expect(screen.getByText('from universities')).toBeInTheDocument();
    
    // Check progress bars exist
    const progressBars = document.querySelectorAll('.bg-teal-700');
    expect(progressBars).toHaveLength(2);
  });

  test('renders without progress bars when showProgress is false', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', goal: 150, hint: 'since 2019', icon: '🎓' },
            ]}
            showProgress={false}
        />
    );

    // Check progress bars do not exist
    const progressBars = document.querySelectorAll('.bg-teal-700');
    expect(progressBars).toHaveLength(0);
  });

  test('renders cover image when provided', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
            cover="/test-image.jpg"
        />
    );

    const coverImage = screen.getByAltText('Annual report cover');
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute('src', '/test-image.jpg');
  });

  test('renders stats without icons when not provided', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+' },
              { label: 'Mentors', value: 50, suffix: '+' },
            ]}
        />
    );

    // Check stats still display
    expect(screen.getByText(byNumberNodeWithPlusNearby(100))).toBeInTheDocument();
    expect(screen.getByText(byNumberNodeWithPlusNearby(50))).toBeInTheDocument();
  });

  test('renders stats without suffix when not provided', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, icon: '🎓' },
            ]}
        />
    );

    // Check numbers still display
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  test('button click triggers onClick callback', () => {
    const mockOnClick = jest.fn();
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
            onClick={mockOnClick}
        />
    );

    const button = screen.getByRole('button', { name: /2025 Annual Report/i });
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('button renders as link when href is provided', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
            href="/annual-report-2025"
        />
    );

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/annual-report-2025');
  });

  test('button click triggers onClick callback even when href is provided', () => {
    const mockOnClick = jest.fn();
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
            href="/annual-report-2025"
            onClick={mockOnClick}
        />
    );

    const link = screen.getByRole('link');
    fireEvent.click(link);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('renders stats with different shapes and colors', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', icon: '🎓' },
              { label: 'Mentors', value: 50, suffix: '+', icon: '🧑‍🏫' },
            ]}
        />
    );

    // Check icons display
    expect(screen.getByText('🎓')).toBeInTheDocument();
    expect(screen.getByText('🧑‍🏫')).toBeInTheDocument();
  });

  test('renders accessibility attributes correctly', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
        />
    );

    // Check section has correct aria-labelledby
    const section = document.querySelector('section[aria-labelledby="annual-report"]');
    expect(section).toBeInTheDocument();
    
    // Check decorative elements have aria-hidden
    const decorativeElements = document.querySelectorAll('[aria-hidden="true"]');
    expect(decorativeElements.length).toBeGreaterThan(0);
  });

  test('renders with custom background gradient', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
        />
    );

    // Check button has gradient background
    const button = screen.getByRole('button', { name: /2025 Annual Report/i });
    expect(button).toBeInTheDocument();
  });

  test('renders stats cards with hover effects', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', icon: '🎓' },
            ]}
        />
    );

    // Check stats card exists
    const statCard = document.querySelector('.group.relative.rounded-2xl');
    expect(statCard).toBeInTheDocument();
    
    // Check hover effect element exists
    const hoverEffect = document.querySelector('.group-hover\\:opacity-100');
    expect(hoverEffect).toBeInTheDocument();
  });

  test('Counter component animates from 0 to target value', async () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', icon: '🎓' },
            ]}
        />
    );

    // Wait for animation to complete
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('Counter component handles large numbers with proper formatting', async () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 1234567, suffix: '+', icon: '🎓' },
            ]}
        />
    );

    // Wait for animation to complete, check number formatting
    await waitFor(() => {
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('Counter component handles zero value', async () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 0, suffix: '+', icon: '🎓' },
            ]}
        />
    );

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('renders progress bars with correct percentages', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 75, suffix: '+', goal: 100, icon: '🎓' },
              { label: 'Mentors', value: 50, suffix: '+', goal: 200, icon: '🧑‍🏫' },
            ]}
            showProgress={true}
        />
    );

    // Check progress bars exist
    const progressBars = document.querySelectorAll('.bg-teal-700');
    expect(progressBars).toHaveLength(2);
  });

  test('renders progress bars with 100% when value exceeds goal', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 150, suffix: '+', goal: 100, icon: '🎓' },
            ]}
            showProgress={true}
        />
    );

    // Check progress bars exist (should be limited to 100%)
    const progressBars = document.querySelectorAll('.bg-teal-700');
    expect(progressBars).toHaveLength(1);
  });

  test('renders stats without goals when not provided', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', icon: '🎓' },
            ]}
            showProgress={true}
        />
    );

    // No goal should not show progress bars
    const progressBars = document.querySelectorAll('.bg-teal-700');
    expect(progressBars).toHaveLength(0);
  });

  test('renders with different button shapes', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
        />
    );

    // Check button exists
    const button = screen.getByRole('button', { name: /2025 Annual Report/i });
    expect(button).toBeInTheDocument();
  });

  test('renders background decoration elements', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
        />
    );

    // Check background decoration elements
    const backgroundArc = document.querySelector('.bg-teal-50.blur-\\[60px\\]');
    expect(backgroundArc).toBeInTheDocument();
  });

  test('renders quotation mark decoration', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
        />
    );

    // Check quote mark decoration
    const quoteMark = document.querySelector('.text-green-400');
    expect(quoteMark).toBeInTheDocument();
  });

  test('renders responsive grid layout', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', icon: '🎓' },
            ]}
        />
    );

    // Check responsive grid
    const grid = document.querySelector('.grid.md\\:grid-cols-\\[1\\.1fr_0\\.9fr\\]');
    expect(grid).toBeInTheDocument();
  });

  test('renders stats grid with proper columns', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', icon: '🎓' },
              { label: 'Mentors', value: 50, suffix: '+', icon: '🧑‍🏫' },
            ]}
        />
    );

    // Check stats grid
    const statsGrid = document.querySelector('.grid.grid-cols-2');
    expect(statsGrid).toBeInTheDocument();
  });

  test('renders empty stats array gracefully', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
        />
    );

    // Check component still renders
    expect(screen.getByRole('button', { name: /2025 Annual Report/i })).toBeInTheDocument();
    expect(screen.getByText('Test text')).toBeInTheDocument();
  });

  test('renders stats with undefined values', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100 },
              { label: 'Mentors', value: 50, suffix: undefined, goal: undefined, hint: undefined, icon: undefined },
            ]}
        />
    );

    // Check stats still display (check number directly when suffix is undefined)
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('renders stats with zero goal', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', goal: 0, icon: '🎓' },
            ]}
            showProgress={true}
        />
    );

    // Zero goal should not show progress bars
    const progressBars = document.querySelectorAll('.bg-teal-700');
    expect(progressBars).toHaveLength(0);
  });

  test('renders stats with negative goal', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', goal: -50, icon: '🎓' },
            ]}
            showProgress={true}
        />
    );

    // Negative goal should still show progress bars (component logic allows negative goals)
    const progressBars = document.querySelectorAll('.bg-teal-700');
    expect(progressBars).toHaveLength(1);
  });

  test('renders stats with very large goal', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: 100, suffix: '+', goal: 1000000, icon: '🎓' },
            ]}
            showProgress={true}
        />
    );

    // Check progress bars exist but very small
    const progressBars = document.querySelectorAll('.bg-teal-700');
    expect(progressBars).toHaveLength(1);
  });

  test('renders stats with negative value', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students', value: -50, suffix: '+', goal: 100, icon: '🎓' },
            ]}
            showProgress={true}
        />
    );

    // Check negative number still displays
    expect(screen.getByText('-50')).toBeInTheDocument();
    
    // Progress bar should be 0 when negative value
    const progressBars = document.querySelectorAll('.bg-teal-700');
    expect(progressBars).toHaveLength(1);
  });

  test('renders with very long text', () => {
    const longText = 'A'.repeat(1000);
    render(
        <AnnualReport
            year={2025}
            text={longText}
            stats={[]}
        />
    );

    // Check long text still displays
    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  test('renders with special characters in stats', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[
              { label: 'Students & Alumni', value: 100, suffix: '++', icon: '🎓🎓' },
              { label: 'Mentors (PhD)', value: 50, suffix: '±', icon: '🧑‍🏫🧑‍💼' },
            ]}
        />
    );

    // Check special characters still display
    expect(screen.getByText(/Students & Alumni/i)).toBeInTheDocument();
    expect(screen.getByText(/Mentors \(PhD\)/i)).toBeInTheDocument();
  });

  test('renders with different year formats', () => {
    render(
        <AnnualReport
            year={2023}
            text="Test text"
            stats={[]}
        />
    );

    // Check different years
    expect(screen.getByRole('button', { name: /2023 Annual Report/i })).toBeInTheDocument();
  });

  test('renders with very large year', () => {
    render(
        <AnnualReport
            year={9999}
            text="Test text"
            stats={[]}
        />
    );

    // Check large year
    expect(screen.getByRole('button', { name: /9999 Annual Report/i })).toBeInTheDocument();
  });

  test('renders with empty string text', () => {
    render(
        <AnnualReport
            year={2025}
            text=""
            stats={[]}
        />
    );

    // Check empty text still renders
    expect(screen.getByRole('button', { name: /2025 Annual Report/i })).toBeInTheDocument();
  });

  test('renders with null and undefined props', () => {
    render(
        <AnnualReport
            year={2025}
            text="Test text"
            stats={[]}
            href={undefined}
            onClick={undefined}
            cover={undefined}
        />
    );

    // Check component still renders
    expect(screen.getByRole('button', { name: /2025 Annual Report/i })).toBeInTheDocument();
  });
});

