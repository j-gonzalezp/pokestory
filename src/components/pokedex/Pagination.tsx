import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  
  const pageVariants = {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: -90 },
  };

  
  const counterVariants = {
    initial: { opacity: 0, rotateX: 90 },
    animate: { opacity: 1, rotateX: 0 },
    exit: { opacity: 0, rotateX: -90 },
  };


  const buttonHoverVariants = {
    hover: {
      y: -2,
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

 


  return (
    <div className="flex items-center space-x-2">
      <motion.div
        variants={buttonHoverVariants}
        whileHover="hover"
        whileTap="tap"
        animate={currentPage === 1 ? "disabled" : ""}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`page-${currentPage}`}
          className="text-sm font-medium min-w-[100px] text-center px-3 py-2 rounded-md bg-gray-50 dark:bg-gray-800"
          initial="initial"
          animate={{
            ...pageVariants.animate,
            backgroundColor: ["rgba(249, 250, 251, 1)", "rgba(249, 250, 251, 0.8)", "rgba(249, 250, 251, 1)"],
          }}
          exit="exit"
          variants={pageVariants}
          transition={{
            duration: 0.3,
            backgroundColor: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <span className="inline-block">Page </span>
          <motion.span
            key={currentPage}
            className="inline-block font-semibold"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={counterVariants}
            transition={{ duration: 0.4 }}
          >
            {currentPage}
          </motion.span>
          <span className="inline-block"> of {totalPages}</span>
        </motion.div>
      </AnimatePresence>

      <motion.div
        variants={buttonHoverVariants}
        whileHover="hover"
        whileTap="tap"
        animate={currentPage === totalPages ? "disabled" : ""}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 transition-all duration-200"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}