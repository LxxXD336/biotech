jest.mock("framer-motion", () => {
    const React = require("react");
    const strip = (props: any = {}) => {
        const {
            animate, initial, exit, transition, variants,
            whileHover, whileTap, whileInView, viewport,
            layout, layoutId, drag, dragConstraints,
            onAnimationStart, onAnimationComplete, onUpdate,
            ...domProps
        } = props;
        if (typeof onAnimationComplete === "function") setTimeout(() => onAnimationComplete(), 0);
        return domProps;
    };
    const motion = new Proxy({}, {
        get: (_: any, tag: any) =>
            ({ children, ...props }: any) => require("react").createElement(String(tag), strip(props), children)
    });
    return { motion };
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectedGroup from "../SelectedGroup";

const groups = [
    { id: "g1", title: "Group One", cover: "https://example.com/1.jpg" },
    { id: "g2", title: "Group Two", cover: "https://example.com/2.jpg" },
    { id: "g3", title: "Group Three", cover: "https://example.com/3.jpg" }
];

function getButtonByTitle(title: string): HTMLButtonElement {
    const label = screen.getByText(title);
    const btn = label.closest("button");
    if (!btn) throw new Error(`Button not found for title: ${title}`);
    return btn as HTMLButtonElement;
}

test("renders all groups as buttons with titles and images", () => {
    const onPick = jest.fn();
    const { container } = render(<SelectedGroup groups={groups} onPick={onPick} onRequestClose={() => {}} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(groups.length);

    groups.forEach(g => {
        const btn = getButtonByTitle(g.title);
        expect(btn).toBeInTheDocument();
        const img = screen.getByAltText(g.title) as HTMLImageElement;
        expect(img).toBeInTheDocument();
        expect(img.src).toContain(g.cover);
    });

    expect(container.firstChild).toBeTruthy();
});

test("clicking a group button calls onPick with the correct group", () => {
    const onPick = jest.fn();
    render(<SelectedGroup groups={groups} onPick={onPick} onRequestClose={() => {}} />);
    const target = getButtonByTitle("Group Two");
    fireEvent.click(target);
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: "g2", title: "Group Two" }));
});

test("clicking outside buttons does not call onPick", () => {
    const onPick = jest.fn();
    const { container } = render(<SelectedGroup groups={groups} onPick={onPick} onRequestClose={() => {}} />);
    const overlay = container.firstElementChild as HTMLElement;
    fireEvent.click(overlay);
    expect(onPick).not.toHaveBeenCalled();
});

test("renders no buttons when groups is empty", () => {
    const onPick = jest.fn();
    render(<SelectedGroup groups={[]} onPick={onPick} onRequestClose={() => {}} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
});
