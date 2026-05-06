"use client";

import { useEffect, useState, useCallback } from "react";
import { type TocEntry } from "@/lib/toc";

type Props = {
  entries: TocEntry[];
  mobile?: boolean;
};

export function TableOfContents({ entries, mobile = false }: Props) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const headingElements = entries
      .map((entry) => ({
        id: entry.id,
        element: document.getElementById(entry.id),
      }))
      .filter((item) => item.element !== null);

    let currentId = "";
    for (const { id, element } of headingElements) {
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 120) {
          currentId = id;
        }
      }
    }
    setActiveId(currentId);
  }, [entries]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
      setIsOpen(false);
    }
  };

  if (entries.length === 0) return null;

  if (mobile) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full text-left text-sm font-semibold text-foreground px-4 py-3 rounded-lg bg-muted border border-border hover:bg-accent transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Table of Contents
        </button>
        {isOpen && (
          <nav className="mt-2 px-4 py-3 rounded-lg bg-muted/50 border border-border">
            <ul className="space-y-1">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    onClick={() => handleClick(entry.id)}
                    className={`block w-full text-left text-sm py-1 transition-colors duration-150 hover:text-foreground ${
                      entry.level === 3 ? "pl-4" : entry.level === 4 ? "pl-8" : ""
                    } ${
                      activeId === entry.id
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {entry.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    );
  }

  return (
    <nav className="sticky top-24">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-3">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-border">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              onClick={() => handleClick(entry.id)}
              className={`block w-full text-left text-[13px] leading-snug py-1.5 border-l-2 -ml-px transition-all duration-150 hover:text-foreground hover:border-foreground/30 ${
                entry.level === 3
                  ? "pl-6"
                  : entry.level === 4
                    ? "pl-9"
                    : "pl-3"
              } ${
                activeId === entry.id
                  ? "text-foreground font-medium border-primary"
                  : "text-muted-foreground border-transparent"
              }`}
            >
              {entry.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
