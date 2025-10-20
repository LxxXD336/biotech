import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import LetterSlide from "./LetterSlide.jsx";

export default function MenuAnimation({ isOpen, onClose, items = [] }) {
  const defaultItems = [
    { label: "About", to: "/#what" },
    {
      label: "Join",
      children: [
        { label: "Getting started", to: "/#getting-started" },
        { label: "FAQs", to: "/#faqs" },
      ],
    },
    {
      label: "Collaborate",
      children: [
        { label: "Mentorship", to: "/#mentorship" },
        { label: "Sponsorship", to: "/#sponsorship" },
        { label: "Outreach", to: "/#outreach" },
      ],
    },
    {
      label: "Satellite",
      children: [
        { label: "Queensland", to: "/#satellite-qld" },
        { label: "Victoria", to: "/#satellite-vic" },
      ],
    },
    {
      label: "Explore",
      children: [
        { label: "Past winners", to: "/#prizes" },
        { label: "Events gallery", to: "/gallery" },
        { label: "News", to: "/news" },
      ],
    },
  ];

  const list = items && items.length ? items : defaultItems;
  const isGrouped = list.some((it) => it.children && it.children.length);

  return createPortal(
      <AnimatePresence>
        {isOpen && (
            <motion.div
                key="menu"
                initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                style={{ position: "fixed", inset: 0, background: "#FBE79B", zIndex: 10000, width: "100vw", height: "100vh" }}
                onClick={onClose}
                aria-modal
                role="dialog"
            >
              <button onClick={onClose} className="menuButton" aria-label="Close menu">
            <span className="hicon" aria-hidden>
              <span className="hbar h1"></span>
              <span className="hbar h2"></span>
              <span className="hbar h3"></span>
            </span>
              </button>

              {!isGrouped ? (
                  <div id="menuList" onClick={(e) => e.stopPropagation()}>
                    {list.map((it, idx) => (
                        <div className="menuText" key={it.label}>
                          <Link to={it.to} onClick={onClose} className="menuLink">
                            <LetterSlide text={it.label} delay={idx * 0.08} />
                          </Link>
                        </div>
                    ))}
                  </div>
              ) : (
                  <GroupedMenu onClose={onClose} groups={list} />
              )}
            </motion.div>
        )}
      </AnimatePresence>,
      document.body
  );
}

function GroupedMenu({ groups, onClose }) {
  const safeGroups = groups.map((g) => ({ ...g, children: g.children || [] }));
  const defaultIdx = Math.max(0, safeGroups.findIndex((g) => /explore/i.test(g.label)));
  const [hoverIdx, setHoverIdx] = useState(defaultIdx);
  const [lockedIdx, setLockedIdx] = useState(null);
  const active = lockedIdx ?? hoverIdx;

  const onEnter = (idx) => {
    if (lockedIdx == null) setHoverIdx(idx);
  };
  const onClickGroup = (idx) => {
    setLockedIdx((cur) => (cur === idx ? null : idx));
    setHoverIdx(idx);
  };

  return (
      <div
          onClick={(e) => e.stopPropagation()}
          style={{ position: "absolute", top: "50%", left: "8%", right: "8%", transform: "translateY(-50%)" }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 14 }}>
            {safeGroups.map((g, idx) => (
                <div
                    key={g.label}
                    onMouseEnter={() => onEnter(idx)}
                    onFocus={() => onEnter(idx)}
                    onClick={() => onClickGroup(idx)}
                    tabIndex={0}
                    style={{ outline: "none", userSelect: "none", cursor: "default" }}
                >
                  <div className="menuText" style={{ lineHeight: 1 }}>
                    {g.to ? (
                        <Link
                            to={g.to}
                            onClick={onClose}
                            className="menuLink"
                            style={{
                              textDecoration: "none",
                              fontSize: "clamp(44px, 7.5vw, 96px)",
                              fontWeight: 900,
                              letterSpacing: "-0.5px",
                              cursor: "pointer",
                              opacity: active === idx ? 1 : 0.65,
                              transition: "opacity .15s ease",
                            }}
                        >
                          <LetterSlide text={g.label} delay={idx * 0.06} />
                        </Link>
                    ) : (
                        <span
                            className="menuLink"
                            style={{
                              display: "inline-block",
                              fontSize: "clamp(44px, 7.5vw, 96px)",
                              fontWeight: 900,
                              letterSpacing: "-0.5px",
                              cursor: "default",
                              opacity: active === idx ? 1 : 0.65,
                              transition: "opacity .15s ease",
                            }}
                        >
                    <LetterSlide text={g.label} delay={idx * 0.06} />
                  </span>
                    )}
                  </div>
                </div>
            ))}
          </div>

          <div style={{ alignSelf: "stretch" }}>
            <motion.div
                key={active}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.25 }}
            >
              <div style={{ display: "grid", gap: 14 }}>
                {safeGroups[active]?.children?.map((c) => (
                    <Link
                        key={c.label}
                        to={c.to}
                        onClick={onClose}
                        className="menuLink"
                        style={{
                          fontSize: "clamp(26px, 4vw, 42px)",
                          fontWeight: 800,
                          letterSpacing: "-0.2px",
                          textDecoration: "none",
                          cursor: "pointer",
                          display: "block",
                        }}
                    >
                      {c.label}
                    </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
  );
}
