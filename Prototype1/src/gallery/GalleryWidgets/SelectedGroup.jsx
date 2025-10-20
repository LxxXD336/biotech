import React from "react";
import { motion } from "framer-motion";

export default function SelectedGroup({ groups, onPick, onRequestClose }) {
    const container = {
        initial: { opacity: 0, y: 6 },
        animate: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.35,
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.08,
            },
        },
        exit: { opacity: 0, y: 8, transition: { duration: 0.25, ease: "easeIn" } },
    };

    const item = {
        initial: { opacity: 0, y: 10, scale: 0.98 },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.35, ease: "easeOut" },
        },
    };

    return (
        <motion.div
            variants={container}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.12))",
                backdropFilter: "blur(2px)",
                pointerEvents: "auto",
            }}
            onClick={(e) => {
            }}
        >
            <motion.div
                style={{
                    display: "grid",
                    gridAutoFlow: "column",
                    gap: 16,
                    width: "min(92vw, 1200px)",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {groups.map((g) => (
                    <motion.button
                        key={g.id}
                        variants={item}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPick(g);
                        }}
                        style={{
                            all: "unset",
                            cursor: "pointer",
                            display: "grid",
                            gridTemplateRows: "1fr auto",
                            width: "min(22vw, 260px)",
                            height: "min(28vw, 300px)",
                            borderRadius: 16,
                            overflow: "hidden",
                            boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
                            background: "#111",
                        }}
                    >
                        <div style={{ position: "relative" }}>
                            <img
                                src={g.cover}
                                alt={g.title}
                                style={{
                                    width: "100%",
                                    height: "220px",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                                draggable={false}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                        "linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35))",
                                }}
                            />
                        </div>
                        <div
                            style={{
                                padding: "10px 12px",
                                color: "white",
                                fontWeight: 700,
                                letterSpacing: 0.3,
                                textAlign: "center",
                                background: "rgba(20,20,20,0.9)",
                            }}
                        >
                            {g.title}
                        </div>
                    </motion.button>
                ))}
            </motion.div>
        </motion.div>
    );
}
