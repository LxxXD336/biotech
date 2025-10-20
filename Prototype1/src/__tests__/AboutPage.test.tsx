import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import AboutPage from '../AboutPage';

// Helper: mock scrollIntoView so we can assert smooth scroll links
beforeAll(() => {
  // @ts-ignore
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  jest.clearAllMocks();
});

describe('AboutPage', () => {
  it('renders the main headline and kicker', () => {
    render(<AboutPage />);

    expect(screen.getByText('Our story')).toBeInTheDocument();

    const h1 = screen.getByRole('heading', { level: 1 });
    const text = (h1.textContent || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    expect(text).toContain('About BIOTech Futures');
  });

  it('shows CTA links and triggers smooth scroll to sections', () => {
    render(<AboutPage />);

    const learnMore = screen.getByRole('link', { name: /learn more/i });
    const milestones = screen.getByRole('link', { name: /our milestones/i });

    expect(learnMore).toBeInTheDocument();
    expect(milestones).toBeInTheDocument();

    // Clicking CTA links should call scrollIntoView on their target sections
    const scrollSpy = jest.spyOn(Element.prototype as any, 'scrollIntoView');

    fireEvent.click(learnMore);
    expect(scrollSpy).toHaveBeenCalled();

    fireEvent.click(milestones);
    expect(scrollSpy).toHaveBeenCalledTimes(2);
  });

  it('renders key impact stats labels', () => {
    render(<AboutPage />);

    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Mentors & Supervisors')).toBeInTheDocument();
    expect(screen.getByText('Partner Organisations')).toBeInTheDocument();
  });

  it('opens and closes the admin login modal', () => {
    render(<AboutPage />);

    const adminTrigger = screen.getByRole('button', { name: 'Open admin login' });
    fireEvent.click(adminTrigger);

    expect(screen.getByText('Admin Login')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Admin Login')).not.toBeInTheDocument();
  });

  it('logs in with default password and shows admin panel', () => {
    render(<AboutPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Open admin login' }));
    const input = screen.getByPlaceholderText('Enter password') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'btf-2024' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    // Admin panel title becomes visible
    expect(screen.getByText('About Page Admin')).toBeInTheDocument();
    // Important admin controls are visible
    expect(screen.getByText('Hero image')).toBeInTheDocument();
    expect(screen.getByText('Values image 1')).toBeInTheDocument();
    expect(screen.getByText('CTA image')).toBeInTheDocument();
  });

  it('shows alert on incorrect password and stays on modal', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<AboutPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Open admin login' }));
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(alertSpy).toHaveBeenCalledWith('Incorrect password');
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    alertSpy.mockRestore();
  });

  it('has a milestones section and CTA scrolls to it', () => {
    render(<AboutPage />);
    const section = document.getElementById('milestones');
    expect(section).toBeTruthy();

    const spy = jest.spyOn(Element.prototype as any, 'scrollIntoView');
    fireEvent.click(screen.getByRole('link', { name: /our milestones/i }));
    expect(spy).toHaveBeenCalled();
  });

  it('closes the admin modal when clicking the backdrop', async () => {
    render(<AboutPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Open admin login' }));
    const modal = await screen.findByRole('dialog', { name: /admin login/i });
    fireEvent.click(modal.parentElement as HTMLElement);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /admin login/i })).not.toBeInTheDocument());
  });

  it('renders stat values with plus suffix', () => {
    render(<AboutPage />);
    const plusCounters = screen.getAllByText((_, node) => {
      if (!node) return false;
      const txt = (node as HTMLElement).textContent || '';
      return /\+\s*$/.test(txt.trim()) || txt.includes('+');
    });
    expect(plusCounters.length).toBeGreaterThanOrEqual(3);
  });

  it('admin Reset All clears image overrides in localStorage', () => {
    // Pre-seed storage with overrides and admin flag
    window.localStorage.setItem('btf.about.hero', 'data:image/png;base64,abc');
    window.localStorage.setItem('btf.about.values.0', 'data:image/png;base64,def');
    window.localStorage.setItem('btf.about.cta', 'data:image/png;base64,ghi');
    window.localStorage.setItem('btf.about.text', JSON.stringify({ 'hero.kicker': 'Ad hoc' }));
    window.sessionStorage.setItem('btf.admin', 'true');

    render(<AboutPage />);

    // Reset All button is visible in the admin panel
    fireEvent.click(screen.getByRole('button', { name: 'Reset All' }));

    expect(window.localStorage.getItem('btf.about.hero')).toBeNull();
    expect(window.localStorage.getItem('btf.about.values.0')).toBeNull();
    expect(window.localStorage.getItem('btf.about.cta')).toBeNull();
    expect(window.localStorage.getItem('btf.about.text')).toBeNull();
  });

  it('shows a helpful message when no team photos are available', () => {
    render(<AboutPage />);
    expect(screen.getByText(/no team photos detected yet/i)).toBeInTheDocument();
  });

  it('updates text overrides when typing in the admin panel', async () => {
    render(<AboutPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Open admin login' }));
    fireEvent.change(screen.getByPlaceholderText('Enter password'), { target: { value: 'btf-2024' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    const panel = await screen.findByText('About Page Admin');
    expect(panel).toBeInTheDocument();

    const heroKickerInput = screen.getByDisplayValue('Our story') as HTMLInputElement;
    fireEvent.change(heroKickerInput, { target: { value: 'New Kicker Copy' } });

    await waitFor(() => expect(heroKickerInput.value).toBe('New Kicker Copy'));
    await waitFor(() => expect(window.localStorage.getItem('btf.about.text')).toContain('New Kicker Copy'));
    expect(screen.getByText('New Kicker Copy')).toBeInTheDocument();
  });
});
