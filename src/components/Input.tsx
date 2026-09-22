import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

const fieldClasses =
  'w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 ring-1 ring-slate-300 ' +
  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50'

interface FieldProps {
  label?: string
  hint?: string
  error?: string
}

interface FieldShellProps extends FieldProps {
  children: ReactNode
}

function FieldShell({ label, hint, error, children }: FieldShellProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  )
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & FieldProps
>(({ label, hint, error, className = '', ...rest }, ref) => (
  <FieldShell label={label} hint={hint} error={error}>
    <input ref={ref} className={`${fieldClasses} ${className}`} {...rest} />
  </FieldShell>
))
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(({ label, hint, error, className = '', ...rest }, ref) => (
  <FieldShell label={label} hint={hint} error={error}>
    <textarea ref={ref} rows={3} className={`${fieldClasses} ${className}`} {...rest} />
  </FieldShell>
))
Textarea.displayName = 'Textarea'

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & FieldProps
>(({ label, hint, error, className = '', children, ...rest }, ref) => (
  <FieldShell label={label} hint={hint} error={error}>
    <select ref={ref} className={`${fieldClasses} ${className}`} {...rest}>
      {children}
    </select>
  </FieldShell>
))
Select.displayName = 'Select'