import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /**
   * When true (default), shell is exactly one dynamic viewport tall and clips overflow so only inner
   * `flex-1 min-h-0 overflow-y-auto` regions scroll (thread / inbox). Use false for login / splash.
   */
  viewportLock?: boolean;
};

/** Centered phone/tablet column with safe areas and subtle frame on large screens. */
export function SupportShell({ children, className, viewportLock = true }: Props) {
  return (
    <div
      className={cn(
        "relative mx-auto flex w-full max-w-md flex-col",
        viewportLock
          ? "h-full min-h-0 max-h-full flex-1 overflow-hidden"
          : "min-h-[100dvh] max-h-[100dvh] overflow-x-hidden overflow-y-auto",
        "border-x border-white/[0.06] bg-zinc-950/75 shadow-[0_0_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-zinc-950/60",
        "box-border pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      {children}
    </div>
  );
}
