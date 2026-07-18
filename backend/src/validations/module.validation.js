const { z } = require('zod');

const STATUS = ['planned', 'in_progress', 'done', 'on_hold'];
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD');

const createModuleSchema = z.object({
  name: z.string().min(2, 'Nama modul minimal 2 karakter').max(150),
  description: z.string().max(5000).optional().nullable(),
  about: z.string().max(50000).optional().nullable(),
  status: z.enum(STATUS).default('planned'),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  pic_user_id: z.coerce.number().int().positive().optional().nullable(),
  order_index: z.coerce.number().int().min(0).default(0),
  start_date: dateString.optional().nullable(),
  target_date: dateString.optional().nullable(),
});

// Partial for updates — every field optional, but at least one present.
const updateModuleSchema = createModuleSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Tidak ada field yang diubah' }
);

module.exports = { createModuleSchema, updateModuleSchema };
