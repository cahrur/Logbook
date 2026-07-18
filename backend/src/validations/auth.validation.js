const { z } = require('zod');
const config = require('../config');

const passwordSchema = z
  .string()
  .min(config.passwordMinLength, `Password minimal ${config.passwordMinLength} karakter`)
  .regex(/[A-Z]/, 'Harus ada huruf besar')
  .regex(/[a-z]/, 'Harus ada huruf kecil')
  .regex(/[0-9]/, 'Harus ada angka');

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const createUserSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().email('Email tidak valid'),
  password: passwordSchema,
  role: z.enum(['superadmin', 'admin', 'member', 'viewer']).default('member'),
});

module.exports = { loginSchema, createUserSchema };
