import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// ---- Mock framer-motion：无动画 div，useInView 恒为 true ----
jest.mock("framer-motion", () => {
  const React = require("react");
  const NoMotion = React.forwardRef((props: any, ref: any) => {
    const {
      initial, animate, transition, whileHover, whileTap, variants,
      ...rest
    } = props || {};
    return React.createElement("div", { ref, ...rest }, props.children);
  });
  return {
    motion: new Proxy({}, { get: () => NoMotion }),
    useInView: () => true,
  };
});

// ---- Mock components/common：提供颜色、Container、useReveal ----
jest.mock("../../../components/common", () => ({
  COLORS: {
    blue: "#39687b",
    white: "#fff",
    green: "#017151",
    lime: "#A7DEA0",
    charcoal: "#334155",
  },
  Container: ({ children, className }: any) => (
    <div data-testid="container" className={className}>{children}</div>
  ),
  useReveal: () => (() => {}) as any,
}));

// 被测组件
import Timeline from "../Timeline";

beforeEach(() => {
  jest.useFakeTimers();
  // 桌面尺寸（影响小人宽高计算，但我们不断言尺寸）
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

function advanceForLayout() {
  // 触发 useEffect 里 100ms 的延迟计算 + 额外 50ms 的重算
  act(() => { jest.advanceTimersByTime(150); });
}

describe("<Timeline />", () => {
    test("基础渲染：Pill/标题/章节链接、ARIA 与列表数量", () => {
    const { container } = render(<Timeline />);

    expect(screen.getByText("KEY DATES")).toBeInTheDocument();

    // 标题是 div 不是 heading，改用 getByText
    expect(screen.getByText(/key international dates 2025/i)).toBeInTheDocument();

    // 章节链接
    const qld = screen.getByRole("link", { name: /queensland/i });
    const vic = screen.getByRole("link", { name: /victoria/i });
    expect(qld).toHaveAttribute("href", "/QueenslandSatellite");
    expect(vic).toHaveAttribute("href", "/VictoriaSatellite");

    // 页面上有两个 list（外层 div[role=list] + 内层 ol），避免 getByRole 单个匹配报错
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBeGreaterThanOrEqual(1);

    // useInView 为真 → 时间线容器 aria-hidden=false（直接选 te2-timeline 更稳）
    const timeline = container.querySelector(".te2-timeline") as HTMLElement;
    expect(timeline).toHaveAttribute("aria-hidden", "false");

    // 共有 6 个节点
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    });


  test("点击节点：展开/收起、进度条更新、小人渲染与点击、波纹消失", () => {
    const { container } = render(<Timeline />);

    // 初始进度为 0%
    const fill = container.querySelector(".te2-progress-fill") as HTMLDivElement;
    expect(fill.style.width).toBe("0%");

    // 先等布局计算
    advanceForLayout();

    // 小人出现（默认指向第 0 个）
    const mascot0 = screen.getByRole("img", { name: /mascot at may 7/i });
    expect(mascot0).toBeInTheDocument();

    // 第 4 个节点（索引 3）：点击展开 → 进度条 60%（3/5）
    const nodes = Array.from(container.querySelectorAll<HTMLButtonElement>(".te2-node"));
    expect(nodes).toHaveLength(6);

    fireEvent.click(nodes[3]);
    // 展开后的 detail 区可见（aria-hidden=false）
    const detail3 = container.querySelector("#te2-detail-3") as HTMLElement;
    expect(detail3).toHaveAttribute("aria-hidden", "false");
    // 进度条 60%
    expect(fill.style.width).toBe("60%");

    // 点击同一节点收起（aria-hidden=true）
    fireEvent.click(nodes[3]);
    expect(detail3).toHaveAttribute("aria-hidden", "true");

    // 点击最后一个节点（索引 5）→ 进度条 100%，小人 aria-label 随之更新
    fireEvent.click(nodes[5]);
    // 触发 toggle 内部 50ms 的重算
    act(() => { jest.advanceTimersByTime(60); });
    const mascot5 = screen.getByRole("img", { name: /mascot at oct 24/i });
    expect(mascot5).toBeInTheDocument();
    expect(fill.style.width).toBe("100%");

    // 点击小人相当于点击当前节点：再次点击后收起最后一个
    fireEvent.click(mascot5);
    const detail5 = container.querySelector("#te2-detail-5") as HTMLElement;
    expect(detail5).toHaveAttribute("aria-hidden", "true");

    // 再次点击任意节点会出现点击波纹，并在 600ms 后消失
    fireEvent.click(nodes[1]);
    expect(container.querySelector(".click-effect")).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(600); });
    expect(container.querySelector(".click-effect")).not.toBeInTheDocument();
  });

  test("标签按键交互：在事件标题上按 Enter/Space 也能切换", () => {
    const { container } = render(<Timeline />);
    advanceForLayout();

    // 找到 “Project submission” 的标签（带 role=button）
    const label = screen.getByRole("button", { name: /project submission/i });

    // Enter 展开
    fireEvent.keyDown(label, { key: "Enter" });
    const detail = container.querySelector("#te2-detail-3") as HTMLElement; // 索引 3 对应 Project submission
    expect(detail).toHaveAttribute("aria-hidden", "false");

    // Space 收起
    fireEvent.keyDown(label, { key: " " });
    expect(detail).toHaveAttribute("aria-hidden", "true");
  });

  test("颜色分支：第 1 / 中间 / 最后节点的月份与日期颜色符合条件表达式", () => {
    const { container } = render(<Timeline />);
    advanceForLayout();

    const items = Array.from(container.querySelectorAll(".te2-item"));

    // 第 1 个（i=0）：month/day 都是 #fff
    {
      const month = items[0].querySelector(".te2-month") as HTMLElement;
      const day = items[0].querySelector(".te2-day") as HTMLElement;
      expect(month).toHaveStyle({ color: "#fff" });
      expect(day).toHaveStyle({ color: "#fff" });
    }

    // 第 3 个（i=2）：month/day 都是 #000
    {
      const month = items[2].querySelector(".te2-month") as HTMLElement;
      const day = items[2].querySelector(".te2-day") as HTMLElement;
      expect(month).toHaveStyle({ color: "#000" });
      expect(day).toHaveStyle({ color: "#000" });
    }

    // 最后一个（i=5）：month 为 rgba(136,136,136,0.7)，day 为 #888
    {
      const month = items[5].querySelector(".te2-month") as HTMLElement;
      const day = items[5].querySelector(".te2-day") as HTMLElement;
      expect(month.style.color.replace(/\s+/g, "")).toBe("rgba(136,136,136,0.7)");
      expect(day).toHaveStyle({ color: "#888" });
    }
  });
});
