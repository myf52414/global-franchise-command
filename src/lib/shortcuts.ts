import { useEffect } from "react";

export type Shortcut = {
  combo: string; // e.g. "mod+k", "shift+n", "/"
  description: string;
  handler: (e: KeyboardEvent) => void;
};

function matches(combo: string, e: KeyboardEvent) {
  const parts = combo.toLowerCase().split("+");
  const key = parts.pop()!;
  const needMod = parts.includes("mod");
  const needShift = parts.includes("shift");
  const needAlt = parts.includes("alt");
  if (needMod && !(e.metaKey || e.ctrlKey)) return false;
  if (needShift && !e.shiftKey) return false;
  if (needAlt && !e.altKey) return false;
  return e.key.toLowerCase() === key;
}

export function useShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      for (const s of shortcuts) {
        if (matches(s.combo, e)) {
          e.preventDefault();
          s.handler(e);
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcuts]);
}
