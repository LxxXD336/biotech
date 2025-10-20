import React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// ---- 依赖最小桩：assets & common ----
jest.mock("../../../assets/images", () => ({
  picChoice2: "pic.jpg",
}));

const MockContainer = ({ children }: any) => (
  <div data-testid="container">{children}</div>
);
jest.mock("../../../components/common", () => ({
  COLORS: { white: "#fff", green: "#017151", lightBG: "#f6fbf9" },
  useReveal: () => (() => {}) as any,
  Container: (props: any) => MockContainer(props),
}));

// 被测组件
import OutreachEventsSection from "../OutreachEvents";

describe("<OutreachEventsSection />", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-10-14T09:00:00+10:00")); // 离目标 24h
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("基础渲染：Pill、标题、按钮、最新活动 CTA 链接", () => {
    render(<OutreachEventsSection />);

    expect(screen.getByText("OUTREACH")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /our outreach and events/i })
    ).toBeInTheDocument();

    // 两个主按钮
    expect(
      screen.getByRole("button", { name: /register interest/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /volunteer/i })
    ).toBeInTheDocument();

    // 最新活动 CTA（a 链接）
    const learn = screen.getByRole("link", { name: /learn more/i });
    expect(learn).toHaveAttribute("href", "/outreach");
  });

  test("受众切换：tablist/aria-selected 与描述文本切换", () => {
    render(<OutreachEventsSection />);

    // 初始 Participants
    const tabs = screen.getByRole("tablist", { name: /audience/i });
    const participants = within(tabs).getByRole("tab", {
      name: /participants/i,
    });
    const mentors = within(tabs).getByRole("tab", { name: /mentors/i });
    const supervisors = within(tabs).getByRole("tab", {
      name: /supervisors/i,
    });

    expect(participants).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByText(/hands-on activities, competitions/i)
    ).toBeInTheDocument();

    // 切到 Mentors
    fireEvent.click(mentors);
    expect(mentors).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByText(/support participants with feedback/i)
    ).toBeInTheDocument();

    // 再切到 Supervisors
    fireEvent.click(supervisors);
    expect(supervisors).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByText(/oversee cohorts, coordinate schedules/i)
    ).toBeInTheDocument();
  });

  test("NextEventProgress：显示倒计时并更新到 Happening now，进度条宽度变化", () => {
    render(<OutreachEventsSection />);

    // 初始时距离 30 天窗口中的 1 天 → 百分比约 97%
    const bar = screen.getByRole("progressbar", {
      name: /progress toward next event/i,
    }) as HTMLElement;
    expect(bar).toBeInTheDocument();
    expect((bar as HTMLDivElement).style.width).toBe("97%");

    // 前进到活动时间，并触发 1 分钟 tick
    jest.setSystemTime(new Date("2025-10-15T09:00:00+10:00"));
    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(screen.getByText(/happening now/i)).toBeInTheDocument();
    expect((bar as HTMLDivElement).style.width).toBe("100%");
  });

  test("TiltImage：鼠标移动产生透视旋转，离开重置 transform", () => {
    render(<OutreachEventsSection />);

    const tilt = screen.getByLabelText("Outreach") as HTMLElement;

    // stub 尺寸，避免 0 导致计算异常
    const rect = {
      x: 0,
      y: 0,
      top: 10,
      left: 10,
      right: 210,
      bottom: 110,
      width: 200,
      height: 100,
      toJSON() {
        return this;
      },
    } as DOMRect;
    jest.spyOn(tilt, "getBoundingClientRect").mockReturnValue(rect);

    // 移动到(160,40)
    fireEvent.mouseMove(tilt, { clientX: 160, clientY: 40 });
    expect(tilt.style.transform).toContain("perspective(900px)");
    expect(tilt.style.transform).toContain("scale(1.02)");
    expect(tilt.style.transform).toMatch(/rotateX\(.+deg\)/);
    expect(tilt.style.transform).toMatch(/rotateY\(.+deg\)/);

    // 离开复位
    fireEvent.mouseLeave(tilt);
    expect(tilt.style.transform).toBe("");
  });

  test("Register modal：打开→遮罩点击关闭；再次打开→Cancel 关闭；Volunteer modal：提交显示感谢并自动关闭；Esc 关闭", () => {
    render(<OutreachEventsSection />);

    // 打开 Register
    fireEvent.click(screen.getByRole("button", { name: /register interest/i }));
    expect(screen.getByRole("heading", { name: /register interest/i })).toBeInTheDocument();

    // 点击遮罩关闭（在 fixed 容器内找 [aria-hidden]）
    const fixed1 = screen.getByRole("heading", { name: /register interest/i }).closest(".fixed.inset-0.z-50") as HTMLElement;
    const backdrop1 = fixed1.querySelector("[aria-hidden]") as HTMLElement;
    fireEvent.click(backdrop1);
    expect(screen.queryByRole("heading", { name: /register interest/i })).not.toBeInTheDocument();

    // 再次打开 Register，点击 Cancel 按钮关闭
    fireEvent.click(screen.getByRole("button", { name: /register interest/i }));
    const cancelBtn = screen.getByRole("button", { name: /^cancel$/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByRole("heading", { name: /register interest/i })).not.toBeInTheDocument();

    // 打开 Volunteer，提交表单 → 显示感谢 → 1.2s 后自动关闭
    fireEvent.click(screen.getByRole("button", { name: /volunteer/i }));
    expect(screen.getByRole("heading", { name: /volunteer with us/i })).toBeInTheDocument();

    // 先填必填字段，再提交
    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: "Alice" } });
    fireEvent.change(screen.getByPlaceholderText(/you@example\.com/i), { target: { value: "alice@example.com" } });
    const submitBtn = screen.getByRole("button", { name: /^submit$/i });
    fireEvent.click(submitBtn);
    expect(screen.getByText(/thank you for volunteering!/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(screen.queryByRole("heading", { name: /volunteer with us/i })).not.toBeInTheDocument();

    // 再开一次 Volunteer，按 Esc 关闭
    fireEvent.click(screen.getByRole("button", { name: /volunteer/i }));
    const fixed2 = screen.getByRole("heading", { name: /volunteer with us/i }).closest(".fixed.inset-0.z-50") as HTMLElement;
    expect(fixed2).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("heading", { name: /volunteer with us/i })).not.toBeInTheDocument();
  });

  test("Latest event 卡片：图片与可达性标签存在", () => {
    render(<OutreachEventsSection />);
    const latestTitle = screen.getByRole("heading", { name: /our latest event/i });
    expect(latestTitle).toBeInTheDocument();

    // 图片 alt 用 event.title 或默认文案
    const img = screen.getByAltText(/open lab guided tour/i) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("pic.jpg");
  });
});
