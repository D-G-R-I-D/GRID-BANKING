"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "@/components/icons";
import { themeStore, type Theme } from "@/lib/theme-store";
import { cn } from "@/lib/cn";

const options: {
  value: Theme;
  label: string;
  Icon: (p: { size?: number }) => React.ReactElement;
}[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
];

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex rounded-full border border-line bg-surface p-0.5"
    >
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => themeStore.set(value)}
          aria-pressed={theme === value}
          aria-label={label}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors",
            theme === value
              ? "bg-accent text-accent-ink"
              : "text-ink-soft hover:text-ink",
          )}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}
