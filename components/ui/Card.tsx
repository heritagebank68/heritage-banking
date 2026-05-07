import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl bg-white border border-[#E5E7EB] shadow-sm', className)} {...props}>
      {children}
    </div>
  )
}
