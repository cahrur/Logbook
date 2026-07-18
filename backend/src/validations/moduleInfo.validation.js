const { z } = require('zod');

// Only http/https links — blocks javascript:, data:, and other XSS-prone schemes.
const httpUrl = z
  .string()
  .max(2048)
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Link harus URL http:// atau https:// yang valid');

const createInfoSchema = z.object({
  module_id: z.coerce.number().int().positive(),
  title: z.string().min(2, 'Judul minimal 2 karakter').max(200),
  description: z.string().max(5000).optional().nullable(),
  link: httpUrl,
});

const updateInfoSchema = z
  .object({
    title: z.string().min(2).max(200),
    description: z.string().max(5000).nullable(),
    link: httpUrl,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Tidak ada field yang diubah' });

const listInfoQuerySchema = z.object({
  module_id: z.coerce.number().int().positive(),
});

module.exports = { createInfoSchema, updateInfoSchema, listInfoQuerySchema };
