import React from 'react'
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default'|'secondary'|'outline'; className?: string }> = ({ children, variant='default', className='' }) => {
  const styles: Record<string,string> = {
    default: 'bg-indigo-500/90 text-white',
    secondary: 'bg-slate-700/70 text-slate-100',
    outline: 'border border-slate-600 text-slate-200'
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${styles[variant]} ${className}`}>{children}</span>
}
