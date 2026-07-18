const { z } = require('zod');

const PRIORITY = ['low', 'medium', 'high', 'critical'];
const STATUS = ['open', 'in_progress', 'resolved', 'closed'];
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD');

const createIssueSchema = z.object({
  module_id: z.coerce.number().int().positive(),
  title: z.string().min(2, 'Judul minimal 2 karakter').max(200),
  description: z.string().max(10000).optional().nullable(),
  priority: z.enum(PRIORITY).default('medium'),
  status: z.enum(STATUS).default('open'),
  deadline: dateString.optional().nullable(),
  assignee_id: z.coerce.number().int().positive().optional().nullable(),
});

const updateIssueSchema = z
  .object({
    title: z.string().min(2).max(200),
    description: z.string().max(10000).nullable(),
    priority: z.enum(PRIORITY),
    status: z.enum(STATUS),
    deadline: dateString.nullable(),
    assignee_id: z.coerce.number().int().positive().nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Tidak ada field yang diubah' });

const listIssueQuerySchema = z.object({
  module_id: z.coerce.number().int().positive(),
});

module.exports = { createIssueSchema, updateIssueSchema, listIssueQuerySchema };
