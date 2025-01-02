'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/src/lib/utils'

export interface Option {
  value: string
  label: string
}

interface CustomSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[]
  label: string
  error?: string
}

export const CustomSelect = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  ({ className, options, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="text-[#008080] font-bold block text-sm" htmlFor={props.id}>
          {label}
        </label>
        <div className="relative">
          <select
            className={cn(
              "w-full px-3 py-2 text-gray-700 bg-white border rounded-md shadow-sm outline-none appearance-none focus:border-[#28a29e] focus:ring focus:ring-[#28a29e] focus:ring-opacity-50",
              error && "border-red-500",
              className
            )}
            ref={ref}
            {...props}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

CustomSelect.displayName = 'CustomSelect'

