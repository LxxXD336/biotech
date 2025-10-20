import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock assets
jest.mock('../Photo/3d.jpg', () => 'mock-3d.jpg');
jest.mock('../Photo/solar.jpg', () => 'mock-solar.jpg');
jest.mock('../Photo/telescope.jpg', () => 'mock-telescope.jpg');
jest.mock('../Photo/p1.jpg', () => 'mock-p1.jpg');
jest.mock('../Photo/p2.jpg', () => 'mock-p2.jpg');
jest.mock('../Photo/p3.jpg', () => 'mock-p3.jpg');

// Mock common components
jest.mock('../../../components/common', () => ({
  COLORS: { white: '#fff', green: '#10b981' },
  Container: ({ children, className }: any) => (
    <div data-testid="container" className={className || ''}>
        {children}
      </div>
  ),
}));

// Mock ResizeObserver
const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.ResizeObserver = mockResizeObserver;

// Mock canvas context
const mockCanvasContext = {
  setTransform: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
  fillStyle: '',
  fillRect: jest.fn(),
  createPattern: jest.fn(() => ({})),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  lineCap: 'round',
  lineJoin: 'round',
  lineWidth: 1,
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(1000).fill(255),
  })),
};

// Preserve original createElement before overriding
const originalCreateElement = document.createElement;

// Create a proper DOM element mock
const createMockCanvas = () => {
  const canvas = originalCreateElement.call(document, 'canvas');
  canvas.width = 200;
  canvas.height = 200;
  canvas.getContext = jest.fn(() => mockCanvasContext);
  canvas.getBoundingClientRect = jest.fn(() => ({
    left: 0,
    top: 0,
    width: 200,
    height: 200,
  }));
  canvas.setPointerCapture = jest.fn();
  canvas.addEventListener = jest.fn();
  canvas.removeEventListener = jest.fn();
  canvas.clientWidth = 200;
  canvas.clientHeight = 200;
  return canvas;
};

// Prefer patching canvas prototype instead of overriding createElement globally
(HTMLCanvasElement.prototype as any).getContext = jest.fn(() => mockCanvasContext);
(HTMLCanvasElement.prototype as any).getBoundingClientRect = jest.fn(() => ({
  left: 0,
  top: 0,
  width: 200,
  height: 200,
}));

// Import component after mocks
import { PrizesSection } from '../PrizesSection';

describe('PrizesSection', () => {
  test('renders section with correct id and background', () => {
    render(<PrizesSection />);

    const section = document.querySelector('#prizes');
    expect(section).toBeInTheDocument();
    expect(section).toHaveStyle('background: #fff');
  });

  test('renders pill text', () => {
    render(<PrizesSection />);
    
    expect(screen.getByText('PRIZES')).toBeInTheDocument();
  });

  test('renders main heading', () => {
    render(<PrizesSection />);
    
    expect(screen.getByRole('heading', { level: 2, name: /what's at stake\?/i })).toBeInTheDocument();
  });

  test('renders description paragraph', () => {
    render(<PrizesSection />);

    expect(screen.getByText(/BIOTech Futures is a chance to highlight your skills/i)).toBeInTheDocument();
  });

  test('renders preview images', () => {
    render(<PrizesSection />);

    expect(screen.getByAltText('Prize preview 1')).toBeInTheDocument();
    expect(screen.getByAltText('Prize preview 2')).toBeInTheDocument();
    expect(screen.getByAltText('Prize preview 3')).toBeInTheDocument();
  });

  test('renders Container component', () => {
    render(<PrizesSection />);

    expect(screen.getByTestId('container')).toBeInTheDocument();
  });

  test('renders all prize items', () => {
    render(<PrizesSection />);

    expect(screen.getByText('3D Printer')).toBeInTheDocument();
    expect(screen.getByText('Solar Powered phone charger')).toBeInTheDocument();
    expect(screen.getByText('Telescope')).toBeInTheDocument();
    expect(screen.getByText('BIOTech Futures Trophy')).toBeInTheDocument();
  });

  test('renders prize images for items with iconSrc', () => {
    render(<PrizesSection />);

    expect(screen.getByAltText('3D Printer')).toBeInTheDocument();
    expect(screen.getByAltText('Solar Powered phone charger')).toBeInTheDocument();
    expect(screen.getByAltText('Telescope')).toBeInTheDocument();
  });

  test('renders emoji for trophy prize', () => {
    render(<PrizesSection />);

    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  test('renders reset button', () => {
    render(<PrizesSection />);
    
    const resetButton = screen.getByRole('button', { name: /reset all/i });
    expect(resetButton).toBeInTheDocument();
  });

  test('reset button click triggers state update', () => {
    render(<PrizesSection />);
    
    const resetButton = screen.getByRole('button', { name: /reset all/i });
    fireEvent.click(resetButton);
    
    // Button should still be present after click
    expect(resetButton).toBeInTheDocument();
  });

  test('renders scratch cards with correct structure', () => {
    render(<PrizesSection />);
    
    const scratchCards = document.querySelectorAll('.scratch-card');
    expect(scratchCards).toHaveLength(4);
    
    scratchCards.forEach(card => {
      expect(card).toHaveClass('scratch-card');
    });
  });

  test('renders scratch content in each card', () => {
    render(<PrizesSection />);
    
    const scratchContents = document.querySelectorAll('.scratch-content');
    expect(scratchContents).toHaveLength(4);
  });

  test('renders scratch titles in each card', () => {
    render(<PrizesSection />);
    
    const scratchTitles = document.querySelectorAll('.scratch-title');
    expect(scratchTitles).toHaveLength(4);
  });

  test('renders scratch icons and emojis', () => {
    render(<PrizesSection />);
    
    const scratchIcons = document.querySelectorAll('.scratch-icon');
    const scratchEmojis = document.querySelectorAll('.scratch-emoji');
    
    expect(scratchIcons).toHaveLength(3); // 3 items with images
    expect(scratchEmojis).toHaveLength(1); // 1 item with emoji
  });

  test('renders intro media grid', () => {
    render(<PrizesSection />);
    
    const introMedia = document.querySelector('.intro-media');
    expect(introMedia).toBeInTheDocument();
  });

  test('renders intro media images with correct styling', () => {
    render(<PrizesSection />);
    
    const introImages = document.querySelectorAll('.intro-media img');
    expect(introImages).toHaveLength(3);
  });

  test('renders with correct grid layout', () => {
    render(<PrizesSection />);
    
    const grid = document.querySelector('.grid.md\\:grid-cols-2');
    expect(grid).toBeInTheDocument();
  });

  test('renders with correct vertical padding', () => {
    render(<PrizesSection />);
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('py-16', 'md:py-20');
  });

  test('renders with correct section styling', () => {
    render(<PrizesSection />);
    
    const section = document.querySelector('#prizes');
    expect(section).toHaveStyle('background: #fff');
  });

  test('renders with correct pill styling', () => {
    render(<PrizesSection />);
    
    const pill = screen.getByText('PRIZES');
    expect(pill).toHaveClass('pill');
  });

  test('renders with correct section title styling', () => {
    render(<PrizesSection />);
    
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toHaveClass('section-title', 'mt-4');
  });

  test('renders with correct section body styling', () => {
    render(<PrizesSection />);
    
    const body = screen.getByText(/BIOTech Futures is a chance to highlight your skills/i);
    expect(body).toHaveClass('section-body', 'mt-4');
  });

  test('renders with correct max width on description', () => {
    render(<PrizesSection />);
    
    const body = screen.getByText(/BIOTech Futures is a chance to highlight your skills/i);
    expect(body).toHaveStyle('max-width: 720px');
  });

  test('renders with correct button styling', () => {
    render(<PrizesSection />);
    
    const button = screen.getByRole('button', { name: /reset all/i });
    expect(button).toHaveClass('btn-outline');
  });

  test('renders with correct accessibility attributes', () => {
    render(<PrizesSection />);
    
    // Check section accessibility
    const section = document.querySelector('#prizes');
    expect(section).toBeInTheDocument();
    
    // Check emoji accessibility
    const emoji = screen.getByText('🏆');
    expect(emoji).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders with correct aria-live attribute on cards', () => {
    render(<PrizesSection />);
    
    const scratchCards = document.querySelectorAll('.scratch-card');
    scratchCards.forEach(card => {
      expect(card).toHaveAttribute('aria-live', 'polite');
    });
  });

  test('renders with correct custom CSS properties', () => {
    render(<PrizesSection />);
    
    const scratchCards = document.querySelectorAll('.scratch-card');
    expect(scratchCards).toHaveLength(4);
    
    // Check that each card has custom CSS properties
    scratchCards.forEach((card, index) => {
      const element = card as HTMLElement;
      expect(element.style.getPropertyValue('--accent')).toBeTruthy();
      expect(element.style.getPropertyValue('--dur')).toBeTruthy();
    });
  });

  test('renders with correct prize accent colors', () => {
    render(<PrizesSection />);
    
    const scratchCards = document.querySelectorAll('.scratch-card');
    expect(scratchCards).toHaveLength(4);
    
    // Check that each card has different accent colors
    const accentColors = Array.from(scratchCards).map(card => 
      (card as HTMLElement).style.getPropertyValue('--accent')
    );
    
    expect(accentColors[0]).toBe('#10b981'); // 3D Printer - green
    expect(accentColors[1]).toBe('#f59e0b'); // Solar charger - orange
    expect(accentColors[2]).toBe('#8b5cf6'); // Telescope - purple
    expect(accentColors[3]).toBe('#06b6d4'); // Trophy - cyan
  });

  test('renders with correct animation durations', () => {
    render(<PrizesSection />);
    
    const scratchCards = document.querySelectorAll('.scratch-card');
    expect(scratchCards).toHaveLength(4);
    
    // Check that each card has different animation durations
    const durations = Array.from(scratchCards).map(card => 
      (card as HTMLElement).style.getPropertyValue('--dur')
    );
    
    expect(durations[0]).toBe('9s');   // 9 + 0 * 0.6
    expect(durations[1]).toBe('9.6s'); // 9 + 1 * 0.6
    expect(durations[2]).toBe('10.2s'); // 9 + 2 * 0.6
    expect(durations[3]).toBe('10.8s'); // 9 + 3 * 0.6
  });

  test('renders without errors', () => {
    render(<PrizesSection />);
    
    // Check that main content is rendered
    expect(screen.getByText('PRIZES')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/BIOTech Futures is a chance/i)).toBeInTheDocument();
  });

  test('handles multiple reset button clicks', () => {
    render(<PrizesSection />);
    
    const resetButton = screen.getByRole('button', { name: /reset all/i });
    
    // Click multiple times
    fireEvent.click(resetButton);
    fireEvent.click(resetButton);
    fireEvent.click(resetButton);
    
    // Button should still be present
    expect(resetButton).toBeInTheDocument();
  });

  test('renders with correct responsive classes', () => {
    render(<PrizesSection />);
    
    const grid = document.querySelector('.grid.md\\:grid-cols-2');
    expect(grid).toHaveClass('grid', 'gap-10', 'md:grid-cols-2', 'items-start');
  });

  test('renders with correct container classes', () => {
    render(<PrizesSection />);
    
    const container = screen.getByTestId('container');
    expect(container).toHaveClass('py-16', 'md:py-20');
  });

  test('renders with correct section structure', () => {
    render(<PrizesSection />);
    
    const section = document.querySelector('#prizes');
    const container = section?.querySelector('[data-testid="container"]');
    const grid = container?.querySelector('.grid');
    
    expect(section).toBeInTheDocument();
    expect(container).toBeInTheDocument();
    expect(grid).toBeInTheDocument();
  });

  test('renders with correct left column structure', () => {
    render(<PrizesSection />);

    const leftColumn = screen.getByText('PRIZES').closest('div');
    expect(leftColumn).toBeInTheDocument();
    
    // Check that left column contains pill, title, body, and media
    expect(leftColumn?.querySelector('.pill')).toBeInTheDocument();
    expect(leftColumn?.querySelector('.section-title')).toBeInTheDocument();
    expect(leftColumn?.querySelector('.section-body')).toBeInTheDocument();
    expect(leftColumn?.querySelector('.intro-media')).toBeInTheDocument();
  });

  test('renders with correct right column structure', () => {
    render(<PrizesSection />);
    
    const rightColumn = document.querySelector('.scratch-wrap');
    expect(rightColumn).toBeInTheDocument();
    
    // Check that right column contains grid and actions
    expect(rightColumn?.querySelector('.scratch-grid')).toBeInTheDocument();
    expect(rightColumn?.querySelector('.scratch-actions')).toBeInTheDocument();
  });

  test('renders with correct prize item structure', () => {
    render(<PrizesSection />);
    
    const scratchCards = document.querySelectorAll('.scratch-card');
    expect(scratchCards).toHaveLength(4);
    
    scratchCards.forEach(card => {
      expect(card.querySelector('.scratch-content')).toBeInTheDocument();
      expect(card.querySelector('.scratch-title')).toBeInTheDocument();
    });
  });

  test('renders with correct media structure', () => {
    render(<PrizesSection />);
    
    const introMedia = document.querySelector('.intro-media');
    expect(introMedia).toBeInTheDocument();
    
    const images = introMedia?.querySelectorAll('img');
    expect(images).toHaveLength(3);
  });

  test('renders with correct button structure', () => {
    render(<PrizesSection />);
    
    const button = screen.getByRole('button', { name: /reset all/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-outline');
  });

  test('renders with correct semantic structure', () => {
    render(<PrizesSection />);
    
    // Check section element
    const section = document.querySelector('#prizes');
    expect(section).toBeInTheDocument();
    
    // Check heading structure
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    
    // Check button structure
    const button = screen.getByRole('button', { name: /reset all/i });
    expect(button).toBeInTheDocument();
  });

  test('renders with proper accessibility labels', () => {
    render(<PrizesSection />);
    
    // Check section accessibility
    const section = document.querySelector('#prizes');
    expect(section).toBeInTheDocument();
    
    // Check image accessibility
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('observes size changes with ResizeObserver', () => {
    render(<PrizesSection />);
    expect((window as any).ResizeObserver).toBeCalled();
  });

  test('scratch does not reveal when foil not cleared enough', () => {
    render(<PrizesSection />);
    const firstCard = document.querySelector('.scratch-card') as HTMLElement;
    const firstCanvas = firstCard.querySelector('canvas') as HTMLCanvasElement;

    // Ensure layout size so paintFoil proceeds
    Object.defineProperty(firstCard, 'clientWidth', { value: 200, configurable: true });
    Object.defineProperty(firstCard, 'clientHeight', { value: 120, configurable: true });

    // Ensure opaque pixels
    const ctx = (firstCanvas as any).getContext('2d');
    const originalGetImageData = ctx.getImageData;
    const len = (firstCanvas.width || 300) * (firstCanvas.height || 150) * 4;
    ctx.getImageData = jest.fn(() => ({
      // opaque everywhere -> alpha=255
      data: new Uint8ClampedArray(len).fill(255),
    }));

    // Simulate quick scratch
    fireEvent.pointerDown(firstCanvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(firstCanvas, { clientX: 20, clientY: 20 });
    fireEvent.pointerUp(firstCanvas);

    expect(firstCard.classList.contains('is-revealed')).toBe(false);

    // restore
    ctx.getImageData = originalGetImageData;
  });

  test('scratch reveals prize, hides hint, and spawns confetti', async () => {
    jest.useFakeTimers();
    render(<PrizesSection />);

    const host = document.querySelector('.scratch-wrap') as HTMLElement;
    const firstCard = document.querySelector('.scratch-card') as HTMLElement;
    const firstCanvas = firstCard.querySelector('canvas') as HTMLCanvasElement;

    // Ensure layout size so paintFoil proceeds
    Object.defineProperty(firstCard, 'clientWidth', { value: 200, configurable: true });
    Object.defineProperty(firstCard, 'clientHeight', { value: 120, configurable: true });

    // Force a mostly cleared foil
    const ctx2 = (firstCanvas as any).getContext('2d');
    const originalGetImageData2 = ctx2.getImageData;
    const len2 = (firstCanvas.width || 300) * (firstCanvas.height || 150) * 4;
    ctx2.getImageData = jest.fn(() => ({ data: new Uint8ClampedArray(len2).fill(0) }));

    // Scratch gesture
    fireEvent.pointerDown(firstCanvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(firstCanvas, { clientX: 60, clientY: 60 });
    fireEvent.pointerUp(firstCanvas);

    // Card revealed and canvas hidden
    expect(firstCard.classList.contains('is-revealed')).toBe(true);
    expect((firstCanvas as any).style.opacity).toBe('0');
    expect((firstCanvas as any).style.pointerEvents).toBe('none');

    // Hint removed after reveal
    expect(firstCard.querySelector('.scratch-hint')).toBeNull();

    // Confetti appended (~26 pieces)
    expect(host.querySelectorAll('.scratch-confetti').length).toBeGreaterThanOrEqual(20);

    // restore
    ctx2.getImageData = originalGetImageData2;
    jest.useRealTimers();
  });

  test('falls back to window.resize when ResizeObserver is unavailable', () => {
    const originalRO = (window as any).ResizeObserver;
    // Remove ResizeObserver to trigger fallback path
    // @ts-ignore
    delete (window as any).ResizeObserver;

    const addSpy = jest.spyOn(window, 'addEventListener');
    render(<PrizesSection />);

    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    addSpy.mockRestore();
    (window as any).ResizeObserver = originalRO;
  });

  test('reset all repaints foil and clears revealed state', async () => {
    render(<PrizesSection />);

    const firstCard = document.querySelector('.scratch-card') as HTMLElement;
    const firstCanvas = firstCard.querySelector('canvas') as HTMLCanvasElement;

    // Ensure layout size so paintFoil proceeds
    Object.defineProperty(firstCard, 'clientWidth', { value: 200, configurable: true });
    Object.defineProperty(firstCard, 'clientHeight', { value: 120, configurable: true });

    // Force reveal first
    const ctx3 = (firstCanvas as any).getContext('2d');
    const originalGetImageData3 = ctx3.getImageData;
    const len3 = (firstCanvas.width || 300) * (firstCanvas.height || 150) * 4;
    ctx3.getImageData = jest.fn(() => ({ data: new Uint8ClampedArray(len3).fill(0) }));
    fireEvent.pointerDown(firstCanvas, { clientX: 10, clientY: 10 });
    fireEvent.pointerUp(firstCanvas);
    expect(firstCard.classList.contains('is-revealed')).toBe(true);

    // Click reset
    fireEvent.click(screen.getByRole('button', { name: /reset all/i }));

    // After repaint, not revealed and canvas interactive again
    await waitFor(() => {
      expect(firstCard.classList.contains('is-revealed')).toBe(false);
      expect((firstCanvas as any).style.opacity).toBe('1');
      expect((firstCanvas as any).style.pointerEvents).toBe('auto');
    });

    ctx3.getImageData = originalGetImageData3;
  });
});