import React from "react";

export const COLORS = {
  green: "#017151",
  charcoal: "#174243",
  white: "#FFFFFF",
  black: "#000000",
  lightBG: "#F6FBF9",
  mint: "#5EA99E",
  navy: "#1A345E",
  blue: "#396B7B",
  yellow: "#F1E5A6",
  lime: "#B6F0C2",
};

export const Container = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`btf-container ${className}`}>{children}</div>;

export function useReveal() {
  const callback = (el: HTMLElement | null) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
  };
  return callback;
}

export const PageSection = ({
  children,
  bg = COLORS.white,
  id,
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
}) => (
  <section id={id} className="w-full" style={{ backgroundColor: bg }}>
    <Container className="py-16 md:py-20">{children}</Container>
  </section>
);

