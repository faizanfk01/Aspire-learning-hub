"use client";
import { motion } from "framer-motion";

// Next.js re-mounts template.tsx on every navigation (unlike layout.tsx),
// so this gives us true per-page entrance animations without AnimatePresence.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Thin orange progress bar that sweeps across the top on each page load */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-orange-500 z-[200] origin-left"
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />

      {/* Page content fade-in + slide-up */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  );
}
