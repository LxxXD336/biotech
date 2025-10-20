import { fireEvent, render, screen } from "@testing-library/react";
import FAQPage from "../FAQPage";

// ✅ mock 不相关依赖（动画 & 组件）
jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy({}, { get: () => (props: any) => <div {...props} /> }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});
jest.mock("../components/MainNav", () => () => <nav>Mocked Nav</nav>);
jest.mock("../components/StyleInject", () => () => <div>Mocked Style</div>);
jest.mock("../sections/home/Cards", () => () => <div>Mocked Cards</div>);
jest.mock("../sections/home/MomentsMarquee", () => () => <div>Mocked Marquee</div>);
jest.mock("../sections/home/Footer", () => () => <footer>Mocked Footer</footer>);

describe("FAQPage (Simplified Tests)", () => {
  beforeEach(() => {
    render(<FAQPage />);
  });

  it("renders navigation and page header", () => {
    expect(screen.getByText(/Mocked Nav/i)).toBeInTheDocument();
    expect(screen.getByText(/Asked Questions/i)).toBeInTheDocument();
  });

  it("renders search bar and control buttons", () => {
    expect(screen.getByLabelText(/Search FAQs/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Expand all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Collapse all/i })).toBeInTheDocument();
  });

  it("renders multiple FAQ items", () => {
    const sample = screen.getByText(/Can I participate as a solo entrant/i);
    expect(sample).toBeInTheDocument();
  });

  it("expands and collapses a single FAQ item on click", () => {
    const button = screen.getByRole("button", { name: /Can I participate as a solo entrant/i });
    fireEvent.click(button);
    expect(screen.getByText(/Yes, you can definitely take part individually/i)).toBeInTheDocument();
    fireEvent.click(button);
    expect(
      screen.queryByText(/Yes, you can definitely take part individually/i)
    ).not.toBeInTheDocument();
  });

  it("expands all FAQs when clicking 'Expand all'", () => {
    const expandAll = screen.getByRole("button", { name: /Expand all/i });
    fireEvent.click(expandAll);
    // 检查任意一个常见回答文本存在
    expect(screen.getByText(/Yes, you can definitely take part individually/i)).toBeInTheDocument();
  });

  it("collapses all FAQs when clicking 'Collapse all'", () => {
    const expandAll = screen.getByRole("button", { name: /Expand all/i });
    const collapseAll = screen.getByRole("button", { name: /Collapse all/i });
    fireEvent.click(expandAll);
    fireEvent.click(collapseAll);
    expect(
      screen.queryByText(/Yes, you can definitely take part individually/i)
    ).not.toBeInTheDocument();
  });

  it("filters FAQs when using search input", () => {
    const searchInput = screen.getByLabelText(/Search FAQs/i);
    fireEvent.change(searchInput, { target: { value: "prototype" } });



    // 确认不相关问题被过滤掉
    expect(
      screen.queryByText(/Can I participate as a solo entrant/i)
    ).not.toBeInTheDocument();
  });

  it("shows no results message when search has no matches", () => {
    const searchInput = screen.getByLabelText(/Search FAQs/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent123" } });
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });

  it("renders footer and other mocked components", () => {
    expect(screen.getByText(/Mocked Footer/i)).toBeInTheDocument();
    expect(screen.getByText(/Mocked Cards/i)).toBeInTheDocument();
    expect(screen.getByText(/Mocked Marquee/i)).toBeInTheDocument();
  });
});
