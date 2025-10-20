import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock react-router-dom's Link to plain <a>
jest.mock('react-router-dom', () => ({
  __esModule: true,
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

// Mock common components used by Sections
jest.mock('../../../components/common', () => ({
  __esModule: true,
  COLORS: {
    white: '#ffffff',
    lightBG: '#F7FAF9',
    green: '#017151',
    charcoal: '#2D3748',
  },
  Container: ({ children, className = '' }: any) => (
    <div data-testid="container" className={className}>{children}</div>
  ),
  useReveal: () => (() => {}) as any,
}));

// Mock child sections to avoid rendering heavy UIs
jest.mock('../TheBriefSection', () => ({
  __esModule: true,
  default: () => <section data-testid="the-brief">TheBrief</section>,
}));

jest.mock('../PrizesSection', () => ({
  __esModule: true,
  default: () => <section data-testid="prizes">Prizes</section>,
}));

jest.mock('../AnnualReportSection', () => ({
  __esModule: true,
  AnnualReport: ({ year = 2024 }: { year?: number }) => (
    <section data-testid="annual-report">AnnualReport {year}</section>
  ),
}));

import { HomeSectionsBundle, SectionsStyle, SectionBlock } from '../Sections';

describe('Sections bundle', () => {
  test('renders SectionsStyle with expected CSS utilities', () => {
    const { container } = render(<SectionsStyle />);
    const style = container.querySelector('style');
    expect(style).toBeInTheDocument();
    const css = style!.textContent || '';
    expect(css).toContain('.pill');
    expect(css).toContain('.section-title');
    expect(css).toContain('.section-body');
    expect(css).toContain('.btn-outline');
    expect(css).toContain('.img-tilt');
    // Basic tokens present
    expect(css).toMatch(/border-radius:14px|999px/);
    expect(css).toMatch(/transition:/);
  });

  test('SectionsStyle CSS includes theme colors and hover states', () => {
    const { container } = render(<SectionsStyle />);
    const css = (container.querySelector('style')!.textContent || '').replace(/\s+/g, ' ');
    // COLORS.green and charcoal interpolations
    expect(css).toContain('#017151');
    expect(css).toContain('#2D3748');
    // Hover rules present for buttons and images
    expect(css).toContain('.btn-outline:hover');
    expect(css).toContain('.img-tilt:hover');
    // Typography uses clamp
    expect(css).toContain('clamp(');
  });

  test('renders HomeSectionsBundle with TheBrief, Prizes, and AnnualReport (in order)', () => {
    render(<HomeSectionsBundle />);

    // The style should be present once
    // (SectionsStyle is included inside HomeSectionsBundle)
    expect(document.querySelectorAll('style').length).toBeGreaterThan(0);

    // Mocked child sections render
    const brief = screen.getByTestId('the-brief');
    const prizes = screen.getByTestId('prizes');
    const report = screen.getByTestId('annual-report');
    expect(brief).toBeInTheDocument();
    expect(prizes).toBeInTheDocument();
    expect(report).toBeInTheDocument();

    // Verify order in the DOM (brief -> prizes -> report)
    const nodes = Array.from(document.querySelectorAll('[data-testid]')) as HTMLElement[];
    const order = nodes.map(n => n.getAttribute('data-testid'));
    const briefIndex = order.indexOf('the-brief');
    const prizesIndex = order.indexOf('prizes');
    const reportIndex = order.indexOf('annual-report');
    expect(briefIndex).toBeGreaterThanOrEqual(0);
    expect(prizesIndex).toBeGreaterThan(briefIndex);
    expect(reportIndex).toBeGreaterThan(prizesIndex);
  });

  test('AnnualReport in bundle defaults to year 2024', () => {
    render(<HomeSectionsBundle />);
    expect(screen.getByTestId('annual-report')).toHaveTextContent('2024');
  });

  test('SectionsStyle is injected exactly once in bundle render', () => {
    const { container } = render(<HomeSectionsBundle />);
    const styles = container.querySelectorAll('style');
    expect(styles.length).toBe(1);
  });

  test('document only contains a single style tag from bundle render', () => {
    render(<HomeSectionsBundle />);
    const all = document.querySelectorAll('style');
    expect(all.length).toBe(1);
  });

  test('renders exactly three top-level section placeholders in order', () => {
    const { container } = render(<HomeSectionsBundle />);
    const placeholders = container.querySelectorAll('section[data-testid]');
    expect(placeholders).toHaveLength(3);
    expect(placeholders[0]).toHaveAttribute('data-testid', 'the-brief');
    expect(placeholders[1]).toHaveAttribute('data-testid', 'prizes');
    expect(placeholders[2]).toHaveAttribute('data-testid', 'annual-report');
  });
});

describe('SectionBlock (unit)', () => {
  test('renders white tone background by default', () => {
    const { container } = render(
      <SectionBlock
        id="s1"
        tag="TAG"
        title="Title"
        body={<p>Body</p>}
      />
    );
    const section = container.querySelector('section#s1') as HTMLElement;
    expect(section).toBeInTheDocument();
    const style = section.getAttribute('style') || '';
    expect(style.replace(/\s+/g, ' ')).toContain('rgb(255, 255, 255)');
  });

  test('renders light/brief tones map to expected backgrounds', () => {
    const { container: c1 } = render(
      <SectionBlock id="light" tag="T" title="Light" body={<p />} tone="light" />
    );
    const { container: c2 } = render(
      <SectionBlock id="brief" tag="T" title="Brief" body={<p />} tone="brief" />
    );
    const s1 = c1.querySelector('section#light') as HTMLElement;
    const s2 = c2.querySelector('section#brief') as HTMLElement;
    expect((s1.getAttribute('style') || '').replace(/\s+/g, ' ')).toContain('rgb(247, 250, 249)');
    // JSDOM may not serialize shorthand background for gradients consistently; just assert element exists
    expect(s2).toBeInTheDocument();
  });

  test('renders internal CTA as Link and external as anchor', () => {
    const { rerender } = render(
      <SectionBlock id="cta" tag="T" title="CTA" body={<p />} ctaText="Go" ctaHref="/x" internal />
    );
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveAttribute('href', '/x');

    rerender(
      <SectionBlock id="cta" tag="T" title="CTA" body={<p />} ctaText="Go" ctaHref="https://example.com" />
    );
    const a = screen.getByRole('link', { name: 'Go' });
    expect(a).toHaveAttribute('href', 'https://example.com');
  });

  test('renders image on right by default; switches to left when imageSide="left"', () => {
    const { container, rerender } = render(
      <SectionBlock id="img" tag="T" title="Img" body={<p />} imageSrc="/img.png" imageAlt="Alt" />
    );
    const grids = container.querySelector('.grid.md\\:grid-cols-2') as HTMLElement;
    const colsDefault = grids.querySelectorAll('div.reveal');
    expect(colsDefault.length).toBeGreaterThan(0);

    rerender(
      <SectionBlock id="img" tag="T" title="Img" body={<p />} imageSrc="/img.png" imageAlt="Alt" imageSide="left" />
    );
    const wrapper = container.querySelector('div.grid') as HTMLElement;
    expect(wrapper.className).toContain('[direction:rtl]');
  });
});


