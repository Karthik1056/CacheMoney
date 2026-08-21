import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-[20px] border p-4 [&>svg~*]:pl-8 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-white/80 transition-all',
  {
    variants: {
      variant: {
        default: 'bg-[#16212d]/80 border-white/10 text-white shadow-md',
        destructive:
          'border-red-500/30 bg-red-500/10 text-red-300 dark:border-red-500/30 [&>svg]:text-red-400',
        warning:
          'border-amber-500/30 bg-amber-500/10 text-amber-300 [&>svg]:text-amber-400',
        info:
          'border-[#2f56ff]/30 bg-[#2f56ff]/10 text-blue-200 [&>svg]:text-[#2f56ff]',
        success:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 [&>svg]:text-emerald-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 text-[15px] font-semibold leading-none tracking-tight text-white', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-[13px] text-white/70 leading-relaxed [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
