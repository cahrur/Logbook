const { z } = require('zod');

const STATUS = ['todo', 'in_progress', 'review', 'done'];
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD');

const createTaskSchema = z.object({
  module_id: z.coerce.number().int().positive(),
  title: z.string().min(2, 'Judul minimal 2 karakter').max(200),
  detail: z.string().max(10000).optional().nullable(),
  deadline: dateString.optional().nullable(),
  status: z.enum(STATUS).default('todo'),
  assignee_id: z.coerce.number().int().positive().optional().nullable(),
  order_index: z.coerce.number().int().min(0).default(0),
});

const updateTaskSchema = z
  .object({
    title: z.string().min(2).max(200),
    detail: z.string().max(10000).nullable(),
    deadline: dateString.nullable(),
    status: z.enum(STATUS),
    assignee_id: z.coerce.number().int().positive().nullable(),
    order_index: z.coerce.number().int().min(0),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Tidak ada field yang diubah' });

const listTaskQuerySchema = z.object({
  module_id: z.coerce.number().int().positive().optional(),
  assignee_id: z.coerce.number().int().positive().optional(),
});

module.exports = { createTaskSchema, updateTaskSchema, listTaskQuerySchema };
