import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";

// —— 轻量 mock：资源与通用组件 ——
// 图片资源
jest.mock("../../../assets/images", () => ({
  WhatIsIt1: "what.jpg",
}));
// PageSection / COLORS / useReveal（ref 回调即可）
const COLORS = { white: "#fff", green: "#017151", lightBG: "#f6fbf9" };
const PageSection = ({ bg, children }: any) => (
  <section data-testid="page-section" data-bg={bg}>{children}</section>
);
jest.mock("../../../components/common", () => ({
  COLORS: { white: "#fff", green: "#017151", lightBG: "#f6fbf9" },
  PageSection: (props: any) => PageSection(props),
  useReveal: () => (() => {}) as any,
}));

// 被测组件
import WhatIsItSection from "../What_is_it";

// —— 工具函数：定位进度条 dom ——
// Stepper 的进度内条（左列卡片内第2条 .h-2.rounded-full）
const getStepperProgressEl = () => {
  const card = screen
    .getByRole("heading", { name: /how it works/i })
    .closest(".rounded-2xl") as HTMLElement;
  const bars = card.querySelectorAll("div.h-2.rounded-full");
  return bars[1] as HTMLDivElement;
};
// Checklist 的进度内条（右列 Readiness 卡片内最后一条 .h-2.rounded-full）
const getChecklistProgressEl = () => {
  const card = screen
    .getByRole("heading", { name: /readiness checklist/i })
    .closest(".rounded-2xl") as HTMLElement;
  const bars = card.querySelectorAll("div.h-2.rounded-full");
  return bars[bars.length - 1] as HTMLDivElement;
};

describe("<WhatIsItSection />", () => {
  beforeEach(() => localStorage.clear());

  test("基础渲染：PageSection 背景、标题、正文、头图与 CTA", () => {
    render(<WhatIsItSection />);

    // PageSection 背景
    expect(screen.getByTestId("page-section")).toHaveAttribute("data-bg", COLORS.white);
    // 左上 pill、标题、正文
    expect(screen.getByText(/what is it\?/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /head start/i })).toBeInTheDocument();
    expect(screen.getByText(/innovation and mentorship program/i)).toBeInTheDocument();

    // 头图
    const img = screen.getByAltText(/students and mentors/i) as HTMLImageElement;
    expect(img.src).toContain("what.jpg");

    // CTA
    const cta = screen.getByRole("link", { name: /next step/i });
    expect(cta).toHaveAttribute("href", "#how-to-join");
  });

  test("Stepper：默认第1步 → 点击第3步，aria-current / 描述 / 进度条 / 下方阶段高亮正确", () => {
    render(<WhatIsItSection />);

    const btn1 = screen.getByRole("button", { name: /^1\.\s*sign up/i });
    const btn3 = screen.getByRole("button", { name: /^3\.\s*sprint/i });

    // 默认第1步
    expect(btn1).toHaveAttribute("aria-current", "step");
    expect(getStepperProgressEl().style.width).toBe("25%");

    // 切到第3步
    fireEvent.click(btn3);
    expect(btn3).toHaveAttribute("aria-current", "step");
    expect(screen.getByText(/8–12 weeks of guided work/i)).toBeInTheDocument();
    expect(getStepperProgressEl().style.width).toBe("75%");
    // 下方阶段列表第3项高亮
     // 下方阶段列表第3项高亮（限定在阶段行容器内查，避免命中上面的按钮）
     const howItWorksCard = screen
       .getByRole("heading", { name: /how it works/i })
       .closest(".rounded-2xl") as HTMLElement;
     const phasesRow =
       howItWorksCard.querySelector("div.flex.justify-between.text-xs") as HTMLElement;
     const sprintSpan = within(phasesRow).getByText(/3\.\s*sprint/i) as HTMLElement;
     expect(sprintSpan.className).toMatch(/font-semibold/);
  });

  test("Checklist：勾选持久化 & 进度条百分比变化（0%→25%→50%→75%→100%→回退到75%）", () => {
    render(<WhatIsItSection />);

    const prog = getChecklistProgressEl();
    expect(prog.style.width).toBe("0%");

    const [consent, teammates, topic, timeline] = screen.getAllByRole("checkbox") as HTMLInputElement[];
    fireEvent.click(consent);
    expect(getChecklistProgressEl().style.width).toBe("25%");
    expect(JSON.parse(localStorage.getItem("btf_ready_check_v1")!)).toMatchObject({ consent: true });

    fireEvent.click(teammates);
    expect(getChecklistProgressEl().style.width).toBe("50%");
    fireEvent.click(topic);
    expect(getChecklistProgressEl().style.width).toBe("75%");
    fireEvent.click(timeline);
    expect(getChecklistProgressEl().style.width).toBe("100%");

    // 取消一个 → 75%
    fireEvent.click(topic);
    expect(getChecklistProgressEl().style.width).toBe("75%");
  });

  test("Checklist：从 localStorage 恢复初始勾选与进度", () => {
    localStorage.setItem("btf_ready_check_v1", JSON.stringify({
      consent: true, teammates: false, topic: true, timeline: false
    }));

    render(<WhatIsItSection />);

    const [consent, teammates, topic, timeline] = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(consent.checked).toBe(true);
    expect(teammates.checked).toBe(false);
    expect(topic.checked).toBe(true);
    expect(timeline.checked).toBe(false);

    expect(getChecklistProgressEl().style.width).toBe("50%");
  });
});
