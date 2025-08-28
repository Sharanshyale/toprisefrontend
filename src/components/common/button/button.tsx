import React from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export interface DynamicButtonProps extends React.ComponentProps<"button"> {
  children?: React.ReactNode
  text?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  loadingText?: string
  asChild?: boolean
  customClassName?: string
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
}

const DynamicButton = React.forwardRef<HTMLButtonElement, DynamicButtonProps>(({
  children,
  text,
  icon,
  iconPosition = 'left',
  loading = false,
  loadingText = 'Loading...',
  variant = 'default',
  size = 'default',
  className,
  customClassName,
  disabled,
  asChild = false,
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          {loadingText && <span className="font-[Poppins]">{loadingText}</span>}
        </>
      )
    }

    if (children) {
      return children
    }

    return (
      <>
        {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
        {text && <span className="font-[Poppins]">{text}</span>}
        {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
      </>
    )
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        customClassName,
        className
      )}
      disabled={isDisabled}
      asChild={asChild}
      {...props}
    >
      {renderContent()}
    </Button>
  )
})

DynamicButton.displayName = 'DynamicButton'

export default DynamicButton
