'use client'
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-[#1A1A2E]">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[#9CA3AF] focus:border-navy focus:ring-2 focus:ring-navy/20',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
