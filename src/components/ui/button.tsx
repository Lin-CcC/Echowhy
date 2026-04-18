import * as React from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

const buttonVariants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-sky-200/90 text-slate-950 shadow-[0_0_34px_rgba(142,216,255,0.24)] hover:bg-sky-100',
  secondary:
    'bg-slate-950/18 text-slate-100 ring-1 ring-white/10 backdrop-blur-md hover:bg-white/10',
  ghost:
    'border border-transparent bg-transparent px-6 py-2 text-slate-500 hover:border-white/10 hover:bg-white/5 hover:text-slate-200',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
