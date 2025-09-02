import React from 'react'

export const Card = ({ className = '', children }: any) => (
  <div className={`rounded-2xl border border-slate-800/60 bg-slate-900/60 p-0 ${className}`}>{children}</div>
)
export const CardHeader = ({ children }: any) => <div className="px-5 pt-5">{children}</div>
export const CardTitle = ({ className = '', children }: any) => <h3 className={`font-semibold ${className}`}>{children}</h3>
export const CardDescription = ({ className = '', children }: any) => <p className={`text-sm text-slate-400 ${className}`}>{children}</p>
export const CardContent = ({ children }: any) => <div className="px-5 pb-4">{children}</div>
export const CardFooter = ({ className = '', children }: any) => <div className={`px-5 pb-5 flex ${className}`}>{children}</div>
