import React from 'react'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'secondary'|'ghost' }
export const Button: React.FC<Props> = ({ variant = 'default', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm transition active:scale-[.98]'
  const variants: Record<string,string> = {
    default: 'bg-indigo-500/90 hover:bg-indigo-500 text-white shadow',
    secondary: 'bg-slate-700/70 hover:bg-slate-700 text-slate-100',
    ghost: 'hover:bg-slate-800/70 text-slate-200'
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
