'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ResizableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

export const ResizableTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ResizableTextareaProps
>(({ minHeight = 100, maxHeight = 600, className = '', onChange, value, ...props }, ref) => {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = ref || internalRef;
  const [height, setHeight] = useState(minHeight);
  const [contentHeight, setContentHeight] = useState(minHeight);

  // Auto-expand textarea based on content
  useEffect(() => {
    const textarea = typeof textareaRef === 'object' ? textareaRef?.current : null;
    if (!textarea) return;

    const updateHeight = () => {
      // Reset to min height to measure actual content height
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;

      // Store content height for validation (can't expand beyond this)
      setContentHeight(Math.max(scrollHeight, minHeight));

      // Set the actual height, capped at maxHeight
      const newHeight = Math.min(scrollHeight, maxHeight);
      setHeight(newHeight);
      textarea.style.height = `${newHeight}px`;
    };

    updateHeight();

    // Update on input
    textarea.addEventListener('input', updateHeight);
    return () => textarea.removeEventListener('input', updateHeight);
  }, [value, minHeight, maxHeight, textareaRef]);

  const handleResize = (direction: 'up' | 'down') => {
    const step = 40;
    let newHeight = height;

    if (direction === 'down') {
      // Can increase up to contentHeight but not beyond
      newHeight = Math.min(height + step, contentHeight, maxHeight);
    } else {
      // Can decrease down to minHeight
      newHeight = Math.max(height - step, minHeight);
    }

    setHeight(newHeight);
    const textarea = typeof textareaRef === 'object' ? textareaRef?.current : null;
    if (textarea) {
      textarea.style.height = `${newHeight}px`;
    }
  };

  const canExpand = height < contentHeight && height < maxHeight;
  const canShrink = height > minHeight;

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        className={`w-full resize-none overflow-hidden transition-all duration-200 ${className}`}
        style={{ height: `${height}px` }}
        {...props}
      />

      {/* Resize Controls */}
      <div className="absolute right-2 bottom-2 flex gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-slate-200/40 dark:border-gray-700/40">
        <button
          type="button"
          onClick={() => handleResize('up')}
          disabled={!canShrink}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Decrease height"
          aria-label="Decrease textarea height"
        >
          <ChevronUp className="w-4 h-4 text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-gray-200" />
        </button>
        <div className="w-px bg-slate-200 dark:bg-gray-700" />
        <button
          type="button"
          onClick={() => handleResize('down')}
          disabled={!canExpand}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Increase height"
          aria-label="Increase textarea height"
        >
          <ChevronDown className="w-4 h-4 text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-gray-200" />
        </button>
      </div>
    </div>
  );
});

ResizableTextarea.displayName = 'ResizableTextarea';
