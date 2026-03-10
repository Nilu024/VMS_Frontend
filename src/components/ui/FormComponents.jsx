import { forwardRef } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

export function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1.5 animate-fadeIn"
      style={{ fontSize: '0.72rem', color: 'hsl(0 72% 52%)', marginTop: '4px', fontWeight: 500 }}>
      <AlertCircle size={11} style={{ flexShrink: 0 }} />
      {message}
    </p>
  )
}

export function FormField({ label, error, required, hint, children }) {
  return (
    <div className="input-group">
      {label && (
        <label>
          {label}
          {required && <span style={{ color: 'hsl(0 72% 58%)', marginLeft: '3px' }}>*</span>}
          {hint && (
            <span style={{ fontWeight: 400, color: 'hsl(220 10% 58%)', fontSize: '0.73rem', marginLeft: '4px' }}>
              — {hint}
            </span>
          )}
        </label>
      )}
      {children}
      <FieldError message={error} />
    </div>
  )
}

export const StyledInput = forwardRef(({ error, type = 'text', className = '', style = {}, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={`vms-input w-full h-10 px-3.5 rounded-xl text-sm outline-none ${className}`}
    style={{
      border: `1.5px solid ${error ? 'hsl(0 72% 58%)' : 'hsl(220 15% 87%)'}`,
      background: 'white',
      color: 'hsl(222 25% 12%)',
      fontFamily: 'inherit',
      ...style,
    }}
    {...props}
  />
))
StyledInput.displayName = 'StyledInput'

export const StyledTextarea = forwardRef(({ error, rows = 3, style = {}, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className="vms-input w-full p-3 rounded-xl text-sm outline-none resize-none"
    style={{
      border: `1.5px solid ${error ? 'hsl(0 72% 58%)' : 'hsl(220 15% 87%)'}`,
      background: 'white',
      color: 'hsl(222 25% 12%)',
      fontFamily: 'inherit',
      ...style,
    }}
    {...props}
  />
))
StyledTextarea.displayName = 'StyledTextarea'

export function SubmitButton({ loading, disabled, children, loadingText = 'Saving…' }) {
  const isDisabled = loading || disabled
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
      style={{
        background: isDisabled ? 'hsl(230 70% 55% / 0.55)' : 'hsl(230 70% 55%)',
        color: 'white',
        boxShadow: isDisabled ? 'none' : '0 4px 14px hsl(230 70% 55% / 0.3)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {loading ? <><Loader2 size={15} className="animate-spin" />{loadingText}</> : children}
    </button>
  )
}

export function DangerButton({ loading, disabled, children, loadingText = 'Deleting…', onClick, type = 'button' }) {
  const isDisabled = loading || disabled
  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold"
      style={{
        background: isDisabled ? 'hsl(0 72% 58% / 0.5)' : 'hsl(0 72% 58%)',
        color: 'white',
        fontFamily: 'inherit',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? <><Loader2 size={14} className="animate-spin" />{loadingText}</> : children}
    </button>
  )
}
