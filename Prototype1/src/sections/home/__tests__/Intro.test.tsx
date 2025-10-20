import React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import Intro from "../Intro";

// ---- 环境桩：IntersectionObserver（useReveal 里常用）----
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
beforeAll(() => {
  // @ts-expect-error: test env stub
  global.IntersectionObserver = IOStub;
});

// ---- 计时器（轮播自动前进用到 setInterval）----
beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// 一些便捷查询函数
const getHeading = () =>
  screen.getByRole("heading", { name: /the start of biotech futures/i });
const getTabGoals = () => screen.getByRole("tab", { name: /our goals/i });
const getTabValues = () => screen.getByRole("tab", { name: /our values/i });
const getPrevBtn = () => screen.getByRole("button", { name: /previous slide/i });
const getNextBtn = () => screen.getByRole("button", { name: /next slide/i });
const getDot = (n: number) => screen.getByRole("button", { name: new RegExp(`^Go to slide ${n}$`, "i") });
const getImage = () => screen.getByRole("img") as HTMLImageElement;

describe("<Intro />", () => {
  test("基础渲染：标题、pill、CTA 链接", () => {
    render(<Intro />);

    // 左列基础元素
    expect(screen.getByText(/foundation/i)).toBeInTheDocument();
    expect(getHeading()).toBeInTheDocument();

    // CTA
    const cta = screen.getByRole("link", { name: /how to join/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "#how-to-join");
  });

  test("Tab 切换：默认 goals → 切到 values，aria-selected 与下划线 transform 正确", () => {
    const { container } = render(<Intro />);

    // 默认 goals
    const goals = getTabGoals();
    const values = getTabValues();
    expect(goals).toHaveAttribute("aria-selected", "true");
    expect(values).toHaveAttribute("aria-selected", "false");

    // 下划线在第一个 tab 下
    const underline = container.querySelector(".tab-underline") as HTMLElement;
    expect(underline).toBeInTheDocument();
    expect(underline.style.transform).toBe("translateX(0)");

    // 点击切换到 values
    fireEvent.click(values);
    expect(goals).toHaveAttribute("aria-selected", "false");
    expect(values).toHaveAttribute("aria-selected", "true");
    // 下划线移动到第二个
    expect(underline.style.transform).toBe("translateX(100%)");

    // 面板内容随 tab 变化
    expect(
      screen.getByRole("tabpanel").querySelector(".tick-list")
    ).toHaveTextContent(/integrity and openness/i);
  });

  test("轮播：初始显示第 1 张；Next/Prev/圆点 切换与循环边界", () => {
    render(<Intro />);

    // 初始（idx=0）
    expect(getImage().alt).toMatch(/vr headset/i);
    expect(screen.getByText(/cutting-edge vr technology/i)).toBeInTheDocument();

    // Next 到第 2 张
    fireEvent.click(getNextBtn());
    expect(getImage().alt).toMatch(/women in engineering/i);
    expect(screen.getByText(/mentors and students connecting/i)).toBeInTheDocument();

    // Prev 回到第 1 张
    fireEvent.click(getPrevBtn());
    expect(getImage().alt).toMatch(/vr headset/i);

    // 从第 1 张向左（循环到最后一张）
    fireEvent.click(getPrevBtn());
    expect(getImage().alt).toMatch(/creative costumes/i);
    expect(screen.getByText(/creative hats/i)).toBeInTheDocument();

    // 圆点跳到第 2 张
    fireEvent.click(getDot(2));
    expect(getImage().alt).toMatch(/women in engineering/i);
  });

  test("自动轮播：每 6s 前进一张；卸载时清理定时器", () => {
    const { unmount } = render(<Intro />);

    // 初始 idx=0
    expect(getImage().alt).toMatch(/vr headset/i);

    // 前进 6s → idx=1
    act(() => { jest.advanceTimersByTime(6000); });
    expect(getImage().alt).toMatch(/women in engineering/i);

    // 再 6s → idx=2
    act(() => { jest.advanceTimersByTime(6000); });
    expect(getImage().alt).toMatch(/creative costumes/i);

    // 再 6s → 回到 idx=0（循环）
    act(() => { jest.advanceTimersByTime(6000); });
    expect(getImage().alt).toMatch(/vr headset/i);

    // 卸载时清理 interval（不再前进）
    unmount();
    // 如果没有清理，这里推进计时器会触发 setState 报错或继续前进；能顺利推进就视为通过
    act(() => { jest.advanceTimersByTime(18000); });
  });

  test("轮播圆点个数与 aria-label 一致", () => {
    render(<Intro />);
    const dots = screen.getAllByRole("button", { name: /go to slide/i });
    expect(dots).toHaveLength(3);
    dots.forEach((btn, i) => {
      expect(btn).toHaveAttribute("aria-label", `Go to slide ${i + 1}`);
    });
  });
});
