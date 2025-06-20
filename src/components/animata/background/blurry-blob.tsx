import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BlurryBlobProps extends HTMLAttributes<HTMLDivElement> {
  firstBlobColor?: string;
  secondBlobColor?: string;
  firstBlobClassName?: string;
  secondBlobClassName?: string;
}

export default function BlurryBlob({
  className,
  firstBlobColor = "bg-blue-400",
  secondBlobColor = "bg-purple-400",
  firstBlobClassName,
  secondBlobClassName,
  ...props
}: BlurryBlobProps) {
  return (
    <div
      {...props}
      className={cn("relative w-full max-w-lg min-h-[13rem] flex items-center justify-center", className)}
    >
      {/* First Blob */}
      <div
        className={cn(
          "absolute h-72 w-72 rounded-full opacity-40 blur-3xl filter mix-blend-multiply animate-pop-blob",
          firstBlobColor,
          firstBlobClassName
        )}
      />

      {/* Second Blob */}
      <div
        className={cn(
          "absolute h-72 w-72 rounded-full opacity-40 blur-3xl filter mix-blend-multiply animate-pop-blob",
          secondBlobColor,
          secondBlobClassName
        )}
      />
    </div>
  );
}
