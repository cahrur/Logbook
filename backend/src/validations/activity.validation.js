const { z } = require('zod');

const CATEGORY = ['development', 'meeting', 'revisi', 'riset', 'blocked'];
const DIRECTIVE_TYPE = ['masukan', 'keputusan', 'perubahan', 'arahan'];
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD');

const createActivitySchema = z.object({
  activity_date: dateString,
  title: z.string().min(2, 'Judul minimal 2 karakter').max(200),
  description: z.string().max(10000).optional().nullable(),
  category: z.enum(CATEGORY).default('development'),
  module_id: z.coerce.number().int().positive().optional().nullable(),
  duration_minutes: z.coerce.number().int().min(0).max(1440).optional().nullable(),
  directive_type: z.enum(DIRECTIVE_TYPE).optional().nullable(),
  directive_from: z.string().trim().max(150).optional().nullable(),
  due_date: dateString.optional().nullable(), // set → jadi tugas dengan tenggat
  completed_at: dateString.optional().nullable(), // set → tugas selesai
});

const updateActivitySchema = createActivitySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Tidak ada field yang diubah' }
);

const listActivityQuerySchema = z.object({
  module_id: z.coerce.number().int().positive().optional(),
  category: z.enum(CATEGORY).optional(),
  directive_type: z.enum(DIRECTIVE_TYPE).optional(),
  created_by: z.coerce.number().int().positive().optional(),
  date_from: dateString.optional(),
  date_to: dateString.optional(),
  search: z.string().trim().min(1).max(200).optional(),
  is_task: z.enum(['true', 'false']).optional(),
  task_status: z.enum(['todo', 'done']).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

module.exports = {
  createActivitySchema,
  updateActivitySchema,
  listActivityQuerySchema,
};
