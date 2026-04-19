import { z } from 'zod'

export const SITES = [
  { label: 'Jabal Ali CT-452-JBL',          name: 'JABAL ALI CT-452-JBL' },
  { label: 'Jabal Ali ET-355-SWT',           name: 'JABAL ALI ET-355-SWT' },
  { label: 'Palm Jumeira PJ-75885-JHL',      name: 'PALM JUMAIRA PJ-75885-JHL' },
  { label: 'DW Dubai 9623-ML',               name: 'DWDUBAI-9623-ML' },
] as const

export const loginSchema = z.object({
  credential: z.string().min(1, 'Badge ID or email is required'),
  password:   z.string().min(1, 'Password is required'),
  site_name:  z.string().optional(),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  job_title: z.string().min(2, 'Work title is required'),
  badge_id:  z.string().min(3, 'Badge ID must be at least 3 characters'),
  email:     z.string().email('Please enter a valid email address'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  site_name: z.string().min(1, 'Please select your work site'),
})

export type LoginInput    = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
