import React from "react";

type Props = {
  /** 左上角的小胶囊，如 WHY / WHO / WHAT */
  eyebrow?: string;
  /** 主标题 */
  title: React.ReactNode;
  /** 可选：标题下方的一排小标签 */
  tags?: string[];
  /** 居中 or 左对齐 */
  align?: "left" | "center";
  /** 主色（默认 emerald） */
  accent?: "emerald" | "blue" | "teal";
  /** 额外 className */
  className?: string;
};

const ACCENT = {
  emerald: {
    pill: "bg-emerald-600",
    dot: "bg-emerald-500",
    chipBorder: "border-emerald-200/60",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-900",
  },
  blue: {
    pill: "bg-blue-600",
    dot: "bg-blue-500",
    chipBorder: "border-blue-200/60",
    chipBg: "bg-blue-50",
    chipText: "text-blue-900",
  },
  teal: {
    pill: "bg-teal-600",
    dot: "bg-teal-500",
    chipBorder: "border-teal-200/60",
    chipBg: "bg-teal-50",
    chipText: "text-teal-900",
  },
};

const SectionHeader: React.FC<Props> = ({
  eyebrow,
  title,
  tags,
  align = "left",
  accent = "emerald",
  className = "",
}) => {
  const c = ACCENT[accent];

  return (
    <header
      className={`w-full ${align === "center" ? "text-center" : "text-left"} ${className}`}
      aria-label="section header"
    >
      {eyebrow && (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm ${c.pill}`}
        >
          {eyebrow}
        </span>
      )}

      <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
        {title}
      </h2>

      {tags && tags.length > 0 && (
        <div
          className={`mt-4 flex flex-wrap gap-2 ${
            align === "center" ? "justify-center" : ""
          }`}
          aria-label="section tags"
        >
          {tags.map((t, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-2 rounded-full border ${c.chipBorder} ${c.chipBg} ${c.chipText} px-3 py-1 text-sm shadow-sm`}
            >
              <span className={`inline-block h-2 w-2 rounded-full ${c.dot}`} />
              {t}
            </span>
          ))}
        </div>
      )}
    </header>
  );
};

export default SectionHeader;
