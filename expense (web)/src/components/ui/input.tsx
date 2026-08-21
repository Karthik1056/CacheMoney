import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-2xl border border-white/10 bg-[#16212d] px-4 py-3 text-sm text-white ring-offset-background placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f56ff] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export { Input };
