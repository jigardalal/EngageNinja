import React from 'react'
import { Check } from 'lucide-react'

export const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const isChecked = checked === true || checked === 'indeterminate'
  const isIndeterminate = checked === 'indeterminate'

  return (
    <label
      ref={ref}
      className={`inline-flex items-center cursor-pointer ${className || ''}`}
    >
      <input
        type="checkbox"
        checked={isChecked && !isIndeterminate}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="hidden"
        {...props}
      />
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isChecked
            ? 'bg-primary border-primary'
            : 'border-white/30 hover:border-white/50'
        }`}
      >
        {isIndeterminate ? (
          <div className="w-3 h-0.5 bg-white" />
        ) : isChecked ? (
          <Check className="h-4 w-4 text-primary-foreground" />
        ) : null}
      </div>
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
