const { z } = require('zod');

const createInfoSchema = z.object({
  module_id: z.coerce.number().int().positive(),
  title: z.string().min(2, 'Judul minimal 2 karakter').max(200),
  description: z.string().max(5000).optional().nullable(),
  link: z.string().url('Link harus URL yang valid').max(2048),
});

const updateInfoSchema = z
  .object({
    title: z.string().min(2).max(200),
    description: z.string().max(5000).nullable(),
    link: z.string().url('Link harus URL yang valid').max(2048),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Tidak ada field yang diubah' });

const listInfoQuerySchema = z.object({
  module_id: z.coerce.number().int().positive(),
});

module.exports = { createInfoSchema, updateInfoSchema, listInfoQuerySchema };
