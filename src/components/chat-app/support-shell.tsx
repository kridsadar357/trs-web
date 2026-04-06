import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Centered phone/tablet column with safe areas and subtle frame on large screens. */
export function SupportShell({ children, className }: Props) {
  return (
    <div
      className={cn(
        "relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col",
        "border-x border-white/[0.06] bg-zinc-950/75 shadow-[0_0_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-zinc-950/60",
        "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
        className
      )}
    >
      {children}
    </div>
  );
}
