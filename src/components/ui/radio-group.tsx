import React, { createContext, useContext, useId } from 'react'
type RGContext = { name: string; value: string; onValueChange: (v: string) => void }
const Ctx = createContext<RGContext | null>(null)
export const RadioGroup: React.FC<{ value: any; onValueChange: (v: string)=>void; className?: string; children: React.ReactNode }> = ({ value, onValueChange, className='', children }) => {
  const name = useId()
  return <Ctx.Provider value={{ name, value, onValueChange }}><div className={className}>{children}</div></Ctx.Provider>
}
export const RadioGroupItem: React.FC<{ id: string; value: string }> = ({ id, value }) => {
  const ctx = useContext(Ctx); if (!ctx) return null
  const checked = String(ctx.value) === String(value)
  return (<input id={id} type="radio" name={ctx.name} value={value} checked={checked} onChange={(e)=>ctx.onValueChange(e.target.value)} className="h-4 w-4 accent-indigo-500" />)
}
