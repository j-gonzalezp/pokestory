import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface SkeletonProps extends React.ComponentProps<"div"> {
  shimmer?: boolean;
  wave?: boolean;
  delay?: number;
}

function Skeleton({ className, shimmer = false, wave = false, delay = 0, ...props }: SkeletonProps) {
  if (wave) {
    return (
      <motion.div
        className={cn(
          "rounded-md relative overflow-hidden bg-muted/60",
          className
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.4,
          delay: delay * 0.1,
          ease: "easeOut"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </motion.div>
    )
  }

  return (
    <div
      data-slot="skeleton"
      role="status"
      className={cn(
        "animate-pulse rounded-md relative overflow-hidden",
        shimmer && "shimmer-effect",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
