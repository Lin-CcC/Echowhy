import * as React from 'react'
import { cn } from '@/lib/utils'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'h-14 w-full rounded-full bg-white/[0.03] px-5 text-sm text-white shadow-[0_8px_32px_rgba(0,0,0,0.2)] outline-none backdrop-blur-xl transition-colors placeholder:text-white/20 border border-white/5 focus:border-white/10 focus:bg-white/[0.04]',
      className,
    )}
    {...props}
  />
))

Input.displayName = 'Input'
