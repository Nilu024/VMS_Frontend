import { z } from 'zod'

// ─── Reusable field rules ─────────────────────────────────────────
const username = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be 30 characters or fewer')
  .regex(/^[a-zA-Z0-9._-]+$/, 'Only letters, numbers, dots, hyphens and underscores allowed')
  .transform(v => v.toLowerCase().trim())

const password = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(72, 'Password is too long')

const mobileIN = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number')

const vehicleIN = z
  .string()
  .regex(/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/, 'Enter a valid vehicle number (e.g. MH12AB1234)')
  .or(z.literal(''))
  .optional()

// ─── Login ────────────────────────────────────────────────────────
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .transform(v => v.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required'),
})

// ─── Create User (Admin - Role Creation) ─────────────────────────
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name is too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters, spaces and common punctuation')
    .transform(v => v.trim()),
  username,
  password,
  role: z.enum(['security', 'manager', 'hr'], {
    required_error: 'Please select a role',
    invalid_type_error: 'Invalid role selected',
  }),
})

// ─── Visitor Check-In (Security) ─────────────────────────────────
export const checkinSchema = z.object({
  visitorName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name is too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters and spaces')
    .transform(v => v.trim()),
  mobileNumber: mobileIN,
  purpose: z
    .string()
    .min(3, 'Purpose must be at least 3 characters')
    .max(200, 'Purpose is too long')
    .transform(v => v.trim()),
  numberOfPersons: z
    .coerce
    .number({ invalid_type_error: 'Enter a valid number' })
    .int('Must be a whole number')
    .min(1, 'Minimum 1 person')
    .max(100, 'Maximum 100 persons'),
  vehicleNumber: z
    .string()
    .optional()
    .transform(v => v?.trim().toUpperCase() || '')
    .refine(v => !v || /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/.test(v), {
      message: 'Enter a valid vehicle number (e.g. MH12AB1234)',
    }),
  visitInTime: z
    .string()
    .min(1, 'Check-in time is required'),
  contactPersons: z
    .array(z.string())
    .min(1, 'Select at least one contact person'),
})

// ─── Visitor Check-Out (Security) ────────────────────────────────
export const checkoutSchema = z.object({
  visitOutTime: z
    .string()
    .min(1, 'Check-out time is required')
    .refine(v => !isNaN(Date.parse(v)), 'Enter a valid date & time'),
})

// ─── Meeting Status Update (Manager / HR) ────────────────────────
export const meetingUpdateSchema = z.object({
  meetingStatus: z.enum(
    ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    { required_error: 'Please select a meeting status' }
  ),
  meetingNotes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .transform(v => v?.trim() || ''),
})

// ─── Report Download (Security) ──────────────────────────────────
export const reportSchema = z
  .object({
    dateFrom: z.string().optional(),
    dateTo:   z.string().optional(),
  })
  .refine(
    data => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo)
      }
      return true
    },
    { message: '"From" date must be before "To" date', path: ['dateTo'] }
  )
