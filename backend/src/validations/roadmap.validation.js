const { z } = require('zod');

const STATUS = ['planned', 'in_progress', 'done'];
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD');

const createRoadmapSchema = z.object({
  module_id: z.coerce.number().int().positive(),
  title: z.string().min(2, 'Judul minimal 2 karakter').max(200),
  description: z.string().max(10000).optional().nullable(),
  status: z.enum(STATUS).default('planned'),
  target_date: dateString.optional().nullable(),
  order_index: z.coerce.number().int().min(0).default(0),
});

const updateRoadmapSchema = createRoadmapSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Tidak ada field yang diubah' });

const listRoadmapQuerySchema = z.object({
  module_id: z.coerce.number().int().positive(),
});

module.exports = { createRoadmapSchema, updateRoadmapSchema, listRoadmapQuerySchema };
