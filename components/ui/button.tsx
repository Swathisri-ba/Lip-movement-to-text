import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const baseClasses =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"

    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
      destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive",
      outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary",
      ghost: "hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary",
      link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
    }

    const sizeClasses = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-6",
      icon: "h-9 w-9 p-0",
    }

    return (
      <Comp
        data-slot="button"
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"

export { Button }
