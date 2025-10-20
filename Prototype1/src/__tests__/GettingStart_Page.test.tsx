import { render, screen } from "@testing-library/react";
import HowToEnterPage from "../GettingStart_Page";

// --- mock 依赖 ---
jest.mock("framer-motion", () => {
  const React = require("react");
  const Mock = (tag: string) => (props: any) => {
    // 过滤掉 motion 专用属性
    const safeProps = { ...props };
    delete safeProps.initial;
    delete safeProps.animate;
    delete safeProps.exit;
    delete safeProps.whileHover;
    delete safeProps.whileInView;
    delete safeProps.transition;
    return React.createElement(tag, safeProps, props.children);
  };
  return {
    motion: new Proxy({}, { get: (_, tag) => Mock("div") }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useReducedMotion: () => false,
  };
});


jest.mock("../components/MainNav", () => () => <nav>Mocked Nav</nav>);
jest.mock("../sections/home/Cards", () => () => <div>Mocked Cards</div>);
jest.mock("../sections/home/Footer", () => () => <footer>Mocked Footer</footer>);
jest.mock("../sections/home/MomentsMarquee", () => () => <div>Mocked Marquee</div>);

describe("HowToEnterPage (Simplified Version)", () => {
  beforeEach(() => {
    render(<HowToEnterPage />);
  });

  it("renders the navigation bar", () => {
    expect(screen.getAllByText(/BIOTech Futures/i).length).toBeGreaterThan(0);
  });



  it("shows the hero call-to-action links", () => {
    expect(screen.getAllByText(/Challenge Handbook/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Register on 7 May 2025/i).length).toBeGreaterThan(0);
  });

  it("renders the 'Who can enter' section", () => {
    expect(screen.getAllByText(/Who can enter/i).length).toBeGreaterThan(0);
  });

  it("renders the 'How Judging Works' section", () => {
    expect(screen.getAllByText(/How Judging Works/i).length).toBeGreaterThan(0);
  });

  it("renders all judging stages titles", () => {
    ["Stage 1", "Stage 2", "Stage 3"].forEach(title => {
      expect(screen.getAllByText(new RegExp(title, "i")).length).toBeGreaterThan(0);
    });
  });

  it("renders the 'Areas of Interest' section", () => {
    expect(screen.getAllByText(/Areas of Interest/i).length).toBeGreaterThan(0);
  });

  it("renders multiple topic cards titles", () => {
    const topics = [
      /Biomedical Innovations/i,
      /Environmental Sustainability/i,
      /AI, Robotics & Smart Systems/i,
    ];
    topics.forEach(topic => {
      expect(screen.getAllByText(topic).length).toBeGreaterThan(0);
    });
  });

  it("renders 'What we need to see' section", () => {
    expect(screen.getAllByText(/What we need to see/i).length).toBeGreaterThan(0);
  });

  it("renders 'Poster tips' banner", () => {
    expect(screen.getAllByText(/Poster tips/i).length).toBeGreaterThan(0);
  });

  it("renders the final CTA section", () => {
    expect(screen.getAllByText(/Registrations open/i).length).toBeGreaterThan(0);
  });

  it("renders the footer content", () => {
    expect(screen.getAllByText(/Footer/i).length).toBeGreaterThan(0);
  });
});
