import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ExploreCollectionButton({ className }: { className?: string }) {
  return (
    <Link
      to="/products"
      className={cn(
        "tf-edge-glow h-11 min-w-[210px] text-[11px] font-semibold tracking-[0.24em] uppercase",
        className,
      )}
    >
      <span className="tf-edge-glow__inner h-full w-full px-6">
        Explore Collection
        <ArrowRight className="size-3.5" strokeWidth={1.75} />
      </span>
    </Link>
  );
}
