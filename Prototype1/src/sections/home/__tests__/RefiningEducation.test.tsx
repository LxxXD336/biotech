import React from "react";
import { render, screen, fireEvent, within, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// --- 依赖最小桩 ---
jest.mock("../../../assets/images", () => ({
  picChoice3: "platform.jpg",
}));

const MockContainer = ({ children }: any) => <div data-testid="container">{children}</div>;
jest.mock("../../../components/common", () => ({
  COLORS: { white: "#fff", green: "#017151", lightBG: "#f6fbf9" },
  useReveal: () => (() => {}) as any,
  Container: (props: any) => MockContainer(props),
}));

// 被测组件
import RefiningEducationSection from "../RefiningEducation";

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("<RefiningEducationSection />", () => {
  test("基础渲染：pill、标题、图片、状态徽章、两个主按钮", () => {
    render(<RefiningEducationSection />);

    expect(screen.getByText(/refining education/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /a platform that supports our community/i })
    ).toBeInTheDocument();

    const img = screen.getByAltText(/platform/i) as HTMLImageElement;
    expect(img.src).toContain("platform.jpg");
    expect(screen.getByText(/all systems operational/i)).toBeInTheDocument();

    // 主按钮
    expect(screen.getByRole("button", { name: /open portal demo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /take a quick tour/i })).toBeInTheDocument();
  });

  test("三枚 Chip 打开 info 弹窗：Docs, Tutorials, FAQ；遮罩/按钮可关闭", () => {
    render(<RefiningEducationSection />);

    // Docs
    fireEvent.click(screen.getByRole("button", { name: /^docs$/i }));
    expect(screen.getByRole("heading", { name: /^docs$/i })).toBeInTheDocument();
    // 用右上角 × 关闭
    const fixed1 = screen
      .getByRole("heading", { name: /^docs$/i })
      .closest(".fixed.inset-0.z-50") as HTMLElement;
    fireEvent.click(within(fixed1).getByLabelText(/close/i));
    expect(screen.queryByRole("heading", { name: /^docs$/i })).not.toBeInTheDocument();

    // Tutorials
    fireEvent.click(screen.getByRole("button", { name: /^tutorials$/i }));
    expect(screen.getByRole("heading", { name: /^tutorials$/i })).toBeInTheDocument();
    const fixed2 = screen
      .getByRole("heading", { name: /^tutorials$/i })
      .closest(".fixed.inset-0.z-50") as HTMLElement;
    // 点击遮罩（aria-hidden 那层）
    const backdrop2 = fixed2.querySelector("[aria-hidden]") as HTMLElement;
    fireEvent.click(backdrop2);
    expect(screen.queryByRole("heading", { name: /^tutorials$/i })).not.toBeInTheDocument();

    // FAQ
    fireEvent.click(screen.getByRole("button", { name: /^faq$/i }));
    expect(screen.getByRole("heading", { name: /^faq$/i })).toBeInTheDocument();
  });

  test("Tour 弹窗：打开并通过右上角 ×（aria-label=Close）关闭", () => {
    render(<RefiningEducationSection />);
    fireEvent.click(screen.getByRole("button", { name: /take a quick tour/i }));
    expect(screen.getByRole("heading", { name: /quick tour/i })).toBeInTheDocument();

    const modal = screen
      .getByRole("heading", { name: /quick tour/i })
      .closest(".fixed.inset-0.z-50") as HTMLElement;
    fireEvent.click(within(modal).getByLabelText(/close/i)); // 点击 × 按钮
    expect(screen.queryByRole("heading", { name: /quick tour/i })).not.toBeInTheDocument();
  });

  test("Portal Demo：打开/关闭切换；Events 添加项目；XP 进度更新", () => {
    render(<RefiningEducationSection />);

    const toggleDemo = screen.getByRole("button", { name: /open portal demo/i });
    fireEvent.click(toggleDemo);
    expect(screen.getByRole("button", { name: /hide portal demo/i })).toBeInTheDocument();

    const addInput = screen.getByPlaceholderText(/add an event/i) as HTMLInputElement;
    const addBtn = screen.getByRole("button", { name: /^add$/i });

    const xpBar = document.querySelector(".h-full.bg-emerald-600") as HTMLDivElement;
    expect(xpBar.style.width).toBe("0%");

    // 添加两个事件（进度>0）
    fireEvent.change(addInput, { target: { value: "Kickoff notes" } });
    fireEvent.click(addBtn);
    fireEvent.change(addInput, { target: { value: "Demo day" } });
    fireEvent.click(addBtn);
    expect(xpBar.style.width).not.toBe("0%");

    fireEvent.click(screen.getByRole("button", { name: /hide portal demo/i }));
    expect(screen.getByRole("button", { name: /open portal demo/i })).toBeInTheDocument();
  });

test("Portal Demo：Chat 发送（按钮 + Enter）与 Resources 勾选，自动把 XP 拉到 100% 触发 Confetti，1.6s 后消失并显示奖杯", async () => {
  render(<RefiningEducationSection />);
  fireEvent.click(screen.getByRole("button", { name: /open portal demo/i }));

  const getXpBar = () => document.querySelector(".h-full.bg-emerald-600") as HTMLDivElement;

  // 先加几条事件抬一手 XP（3 × 12 = 36）
  const addInput = screen.getByPlaceholderText(/add an event/i) as HTMLInputElement;
  const addBtn = screen.getByRole("button", { name: /^add$/i });
  ["E1", "E2", "E3"].forEach((t) => {
    fireEvent.change(addInput, { target: { value: t } });
    fireEvent.click(addBtn);
  });

  // Chat：按钮 + Enter（3 × 8 = 24）
  fireEvent.click(screen.getByRole("button", { name: /^chat$/i }));

  // 关键：每次发送都“现取” input/button，避免切 Tab 后的节点失效
  const send = (txt: string, useEnter = false) => {
    const input = screen.getByPlaceholderText(/say hi/i) as HTMLInputElement;
    const btn = screen.getByRole("button", { name: /^send$/i });
    fireEvent.change(input, { target: { value: txt } });
    useEnter ? fireEvent.keyDown(input, { key: "Enter" }) : fireEvent.click(btn);
  };

  send("hello");
  send("world");
  send("enter!", true);

  // Resources（3 × 6 = 18），进度到 78%
  fireEvent.click(screen.getByRole("button", { name: /^resources$/i }));
  screen.getAllByRole("checkbox").forEach((c) => fireEvent.click(c));

  // 回到 Chat，逐条发送并等待 DOM 刷新，直到 100%
  fireEvent.click(screen.getByRole("button", { name: /^chat$/i }));
  send("more-1");
  await waitFor(() => expect(getXpBar().style.width).not.toBe("78%")); // 确认从 78% 往上了

  // 再发几条直到触顶（每条 +8，保护上限 20 次）
  let guard = 20;
  while (getXpBar().style.width !== "100%" && guard-- > 0) {
    send(`more-${guard}`);
  }
  await waitFor(() => expect(getXpBar().style.width).toBe("100%"));

  // 奖杯出现在 XP 标签旁
  expect(screen.getByText(/xp/i).nextSibling?.textContent).toMatch(/🏆/);

  // Confetti 层出现并在 1.6s 后消失
  const layer = document.querySelector(".pointer-events-none.absolute.inset-0.overflow-hidden") as HTMLElement;
  expect(layer).toBeInTheDocument();
  act(() => { jest.advanceTimersByTime(1700); });
  expect(document.querySelector(".pointer-events-none.absolute.inset-0.overflow-hidden")).not.toBeInTheDocument();
});

});
