'use client';

import React from 'react';

interface ResizableTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
}

export const ResizableTextarea = React.forwardRef<
  HTMLTextAreaElement,
  ResizableTextareaProps
>(({ minHeight = 100, className = '', ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full resize border border-slate-300 dark:border-gray-600 rounded-lg p-3 font-mono text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
      style={{ minHeight: `${minHeight}px` }}
      {...props}
    />
  );
});

ResizableTextarea.displayName = 'ResizableTextarea';
