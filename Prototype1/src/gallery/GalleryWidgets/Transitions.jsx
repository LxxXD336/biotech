import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export function StageFade({
                              show,
                              children,
                              durationIn = 0.35,
                              durationOut = 0.25,
                              offsetYIn = 16,
                              exitY = 8,
                              scaleIn = 0.98,
                              exitOpacity = 0,
                              onExitComplete,
                          }) {
    return (
        <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
            {show && (
                <motion.div
                    key="stage"
                    initial={{ opacity: 0, y: offsetYIn, scale: scaleIn }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: exitOpacity, y: exitY }}
                    transition={{
                        opacity: { duration: durationIn, ease: "easeOut" },
                        y: { duration: durationIn, ease: "easeOut" },
                        scale: { duration: durationIn, ease: "easeOut" },
                    }}
                    style={{ position: "absolute", inset: 0 }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}


export function OverlayShell({
                                 open,
                                 closingStage,
                                 onEntered,
                                 onPanelOutDone,
                                 children,
                                 zIndex = 1000,
                             }) {
    const overlayFade = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25 },
    };

    const panelExit =
        closingStage === "panelOut"
            ? { scale: [1, 0.7, 0.7], y: ["0vh", "0vh", "120vh"], opacity: [1, 1, 0] }
            : { scale: 1, y: 0, opacity: 1 };

    const panelExitTransition =
        closingStage === "panelOut"
            ? { duration: 0.8, ease: "easeInOut", times: [0, 0.5, 1] }
            : { duration: 0 };

    const enteredRef = React.useRef(false);
    React.useEffect(() => { if (open) enteredRef.current = false; }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="overlay"
                    initial={overlayFade.initial}
                    animate={overlayFade.animate}
                    exit={overlayFade.exit}
                    transition={overlayFade.transition}
                    onAnimationComplete={() => {
                        if (!enteredRef.current) {
                            enteredRef.current = true;
                            onEntered?.();
                        }
                    }}
                    style={{ position: "fixed", inset: 0, zIndex, pointerEvents: "auto" }}
                >
                    <motion.div
                        animate={panelExit}
                        transition={panelExitTransition}
                        onAnimationComplete={() => {
                            if (closingStage === "panelOut") onPanelOutDone?.();
                        }}
                        style={{ position: "absolute", inset: 0, background: "transparent"}}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function ScreenIntro({ color = "#121212", duration = 1.2, onDone }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1] }}
            transition={{ duration, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
            <motion.div
                initial={{ y: "30vh", scale: 0.7, borderRadius: 24 }}
                animate={{ y: ["30vh", "0vh", "0vh"], scale: [0.7, 0.7, 1], borderRadius: [24, 24, 0] }}
                transition={{ duration, ease: "easeInOut", times: [0, 0.55, 1] }}
                onAnimationComplete={() => onDone?.()}
                style={{ position: "absolute", inset: 0, background: color, transformOrigin: "center" }}
            />
        </motion.div>
    );
}

export function IntroGate({
                              play,
                              color = "#121212",
                              duration = 1.2,
                              onDone,
                              persistBackdropAfter,
                              zIndexIntro = 1001,
                              zIndexBackdrop = 800,
                          }) {
    const [running, setRunning] = React.useState(false);
    const [played, setPlayed] = React.useState(false);
    const prevPlay = React.useRef(false);
    React.useEffect(() => {
        if (play && !prevPlay.current) {
            setRunning(true);
            setPlayed(true);
        }
        prevPlay.current = play;
    }, [play]);

    return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {running && (
                <div style={{ position: "absolute", inset: 0, zIndex: zIndexIntro }}>
                    <ScreenIntro
                        color={color}
                        duration={duration}
                        onDone={() => {
                            setRunning(false);
                            onDone?.();
                        }}
                    />
                </div>
            )}
            {persistBackdropAfter && played && !running && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: color,
                        zIndex: zIndexBackdrop,
                        pointerEvents: "none",
                    }}
                />
            )}
        </div>
    );
}

