import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Hero from "../Hero";

// —— 环境/依赖的轻量 mock ——
// 背景图资源（避免打包器处理）
jest.mock("../../Photo/bg.jpg", () => "bg.jpg");

// framer-motion 用无动画 div 代替，和你项目里其他测试写法保持一致
jest.mock("framer-motion", () => {
  const React = require("react");
  const strip = (p: any) => {
    // 去掉 motion 专有 props，防止 React 报 unknown attribute
    const {
      initial, animate, exit, transition,
      whileHover, whileTap, whileInView,
      variants, layout, layoutId,
      drag, dragConstraints,
      ...rest
    } = p || {};
    return rest;
  };
  const NoMotion = React.forwardRef((props: any, ref: any) =>
    React.createElement("div", { ref, ...strip(props) }, props.children)
  );
  return {
    motion: new Proxy({}, { get: () => NoMotion }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// 让 OrbitAroundTarget 能算出几何尺寸（否则在 JSDOM 下宽高为 0 不会渲染芯片）
beforeAll(() => {
  const rect = {
    x: 0, y: 0, top: 0, left: 0, right: 400, bottom: 300,
    width: 400, height: 300, toJSON() { return this; }
  } as DOMRect;
  jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => rect);
});

describe("<Hero />", () => {
  beforeEach(() => {
    // 清空 hash，便于判断锚点跳转
    window.location.hash = "";
  });

  test("renders CTA as a button-styled link with correct href and is clickable", () => {
    render(<Hero />);

    const cta = screen.getByRole("link", { name: /Explore projects/i });
    expect(cta).toBeInTheDocument();

    // href 应该是 #projects
    expect(cta).toHaveAttribute("href", "#projects");

    // 点击应更新 hash（证明可点击，未被前景层阻挡）
    fireEvent.click(cta); // 可点击
    expect(cta).toHaveAttribute("href", "#projects");
  });

  test("renders provided content (over/title/lead)", () => {
    render(
      <Hero
        content={{
          heroOver: "TEST OVER",
          heroTitle: "Hello\nWorld",
          heroLead: "Lead paragraph here",
        }}
      />
    );

    expect(screen.getByText("TEST OVER")).toBeInTheDocument();
    // 标题中间有 <br/>，用正则跨节点匹配
    expect(screen.getByText(/^\s*Hello\s*World\s*$/i)).toBeInTheDocument();
    expect(screen.getByText("Lead paragraph here")).toBeInTheDocument();
  });

  test("uses YouTube embed with autoplay+mute when autoPlayMuted is true (default)", () => {
    render(<Hero />);
    const iframe = screen.getByTitle("Hero video") as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    const src = iframe.getAttribute("src") || "";
    expect(src).toContain("youtube.com/embed/0zrfebSOCqs");
    expect(src).toContain("autoplay=1");
    expect(src).toContain("mute=1");
    expect(src).toContain("loop=1");
    expect(src).toContain("playlist=0zrfebSOCqs");
  });

  test("disables autoplay params when autoPlayMuted=false", () => {
    render(<Hero autoPlayMuted={false} />);
    const iframe = screen.getByTitle("Hero video") as HTMLIFrameElement;
    const src = iframe.getAttribute("src") || "";
    // 不应包含自动播放相关参数
    expect(src).toContain("youtube.com/embed/0zrfebSOCqs");
    expect(src).not.toContain("autoplay=1");
    expect(src).not.toContain("mute=1");
  });

  test("renders orbit chips for provided topics", async () => {
    const topics = ["A", "B", "C", "D"];
    render(<Hero topics={topics} />);

    // OrbitAroundTarget 会把 topics 分两圈渲染；每个文本至少出现一次
    for (const t of topics) {
      expect(await screen.findAllByText(t)).not.toHaveLength(0);
    }
  });
});
