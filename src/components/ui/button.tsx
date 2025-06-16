import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Bloomberg Terminal Button Component
// Designed to match professional financial terminal aesthetics
// with proper accessibility and keyboard navigation support

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-terminal text-terminal-sm font-semibold letter-spacing-wide uppercase transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloomberg-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border-terminal-xs',
  {
    variants: {
      variant: {
        default: 'bg-bloomberg-orange text-black border-bloomberg-orange hover:bg-bloomberg-orange/90 hover:shadow-terminal-glow active:transform active:translate-y-px',
        destructive: 'bg-transparent text-bloomberg-red border-bloomberg-red hover:bg-bloomberg-red hover:text-black hover:shadow-lg',
        outline: 'bg-transparent text-bloomberg-orange border-bloomberg-orange/30 hover:border-bloomberg-orange hover:bg-bloomberg-orange/10 hover:shadow-terminal',
        secondary: 'bg-transparent text-bloomberg-blue border-bloomberg-blue hover:bg-bloomberg-blue hover:text-white hover:shadow-lg',
        ghost: 'bg-transparent text-bloomberg-orange/80 border-transparent hover:bg-bloomberg-orange/10 hover:text-bloomberg-orange hover:border-bloomberg-orange/30',
        link: 'bg-transparent text-bloomberg-orange border-transparent underline-offset-4 hover:underline hover:text-bloomberg-orange/80',
        success: 'bg-transparent text-bloomberg-green border-bloomberg-green hover:bg-bloomberg-green hover:text-black hover:shadow-lg',
        warning: 'bg-transparent text-bloomberg-yellow border-bloomberg-yellow hover:bg-bloomberg-yellow hover:text-black hover:shadow-lg',
        terminal: 'bg-black text-bloomberg-orange border-bloomberg-orange/30 hover:border-bloomberg-orange hover:bg-bloomberg-orange/5 font-mono text-terminal-xs tracking-wider',
      },
      size: {
        default: 'h-9 px-4 py-2 text-terminal-sm',
        sm: 'h-7 px-3 py-1 text-terminal-xs',
        lg: 'h-11 px-6 py-3 text-terminal-base',
        xl: 'h-13 px-8 py-4 text-terminal-lg',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0',
        'icon-lg': 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          // Add terminal scanlines effect for authentic Bloomberg look
          'relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-transparent before:to-transparent before:opacity-20 before:pointer-events-none',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants } 