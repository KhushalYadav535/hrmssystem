import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** API may return designation as legacy string, ObjectId string, or populated { _id, name }. Never pass raw objects to React text. */
export function formatDesignationLabel(designation: unknown): string {
  if (designation == null || designation === '') return ''
  if (typeof designation === 'string') return designation
  if (typeof designation !== 'object' || designation === null) return String(designation)
  const o = designation as { name?: unknown; _id?: unknown }
  if (typeof o.name === 'string' && o.name.length > 0) return o.name
  if (o._id != null) return String(o._id)
  return ''
}

/** Value for Select/inputs: always an id string, never a populated object. */
export function designationToIdString(designation: unknown): string {
  if (designation == null || designation === '') return ''
  if (typeof designation === 'string') return designation
  if (typeof designation === 'object' && designation !== null && '_id' in designation) {
    return String((designation as { _id: unknown })._id)
  }
  return ''
}
