"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-zinc-800 hover:bg-zinc-950/10 dark:text-white dark:hover:bg-white/15"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 text-amber-600 transition-all dark:-rotate-90 dark:scale-0 dark:text-amber-400" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 text-indigo-600 transition-all dark:rotate-0 dark:scale-100 dark:text-indigo-300" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
