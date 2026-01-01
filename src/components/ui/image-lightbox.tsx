"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  src,
  alt,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      // Prevent scrolling on the body when lightbox is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button in top-right corner */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 rounded-none border-2 border-primary bg-background p-2 text-primary transition-all hover:bg-primary hover:text-primary-foreground active:translate-y-0.5"
            style={{
              boxShadow: "4px 4px 0 rgba(233,69,96,0.5)",
            }}
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-[90vw] max-h-[90vh] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative pixel corners */}
            <div className="absolute -top-2 -left-2 w-3 h-3 bg-primary z-10"></div>
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary z-10"></div>
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary z-10"></div>
            <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-primary z-10"></div>

            {/* Image with retro border */}
            <div className="border-4 border-primary bg-background p-2 shadow-[8px_8px_0_rgba(233,69,96,0.5)]">
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={800}
                className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
                style={{ imageRendering: "auto" }}
                unoptimized
              />
            </div>

            {/* Alt text caption */}
            {alt && (
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <p className="text-sm text-white/80 font-pixel px-4 py-2 bg-black/50 rounded-none inline-block">
                  {alt}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
