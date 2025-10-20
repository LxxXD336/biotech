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
    const AnimatePresence = ({ children, onExitComplete }: any) => {
        const React = require("react");
        React.useEffect(() => { if (typeof onExitComplete === "function") onExitComplete(); }, []);
        return <>{children}</>;
    };
    const useInView = () => true;
    return { motion, AnimatePresence, useInView };
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { StageFade, OverlayShell, ScreenIntro, IntroGate } from "../Transitions";

test("StageFade calls onExitComplete and unmounts when show=false", async () => {
    const onExitComplete = jest.fn();
    const { rerender } = render(
        <StageFade show={true} onExitComplete={onExitComplete}>
            <div data-testid="sf" />
        </StageFade>
    );
    await waitFor(() => expect(onExitComplete).toHaveBeenCalled());
    rerender(
        <StageFade show={false} onExitComplete={onExitComplete}>
            <div data-testid="sf" />
        </StageFade>
    );
    expect(screen.queryByTestId("sf")).toBeNull();
});

test("OverlayShell triggers onEntered once, panelOut calls onPanelOutDone, and closes", async () => {
    const onEntered = jest.fn();
    const onPanelOutDone = jest.fn();
    const { rerender } = render(
        <OverlayShell open={true} onEntered={onEntered}>
            <div data-testid="panel" />
        </OverlayShell>
    );
    await waitFor(() => expect(onEntered).toHaveBeenCalledTimes(1));
    rerender(
        <OverlayShell open={true} closingStage="panelOut" onPanelOutDone={onPanelOutDone}>
            <div data-testid="panel" />
        </OverlayShell>
    );
    await waitFor(() => expect(onPanelOutDone).toHaveBeenCalledTimes(1));
    rerender(
        <OverlayShell open={false}>
            <div data-testid="panel" />
        </OverlayShell>
    );
    expect(screen.queryByTestId("panel")).toBeNull();
});

test("ScreenIntro calls onDone", async () => {
    const onDone = jest.fn();
    render(<ScreenIntro onDone={onDone} />);
    await waitFor(() => expect(onDone).toHaveBeenCalled());
});

test("IntroGate with play and persistBackdropAfter calls onDone and keeps backdrop", async () => {
    const onDone = jest.fn();
    const { container } = render(
        <IntroGate play={true} color="#123456" persistBackdropAfter onDone={onDone} zIndexBackdrop={4321} />
    );

    await waitFor(() => expect(onDone).toHaveBeenCalled());

    await waitFor(() => {
        const backdrop = container.querySelector('div[style*="z-index: 4321"]');
        expect(backdrop).toBeTruthy();
    });
});



test("IntroGate without play does not render backdrop", () => {
    const onDone = jest.fn();
    const { container } = render(<IntroGate play={false} color="#abcdef" persistBackdropAfter={false} onDone={onDone} />);
    expect(onDone).not.toHaveBeenCalled();
    const backdrop =
        container.querySelector('div[style*="background: #abcdef"]') ||
        container.querySelector('div[style*="background:#abcdef"]');
    expect(backdrop).toBeNull();
});
