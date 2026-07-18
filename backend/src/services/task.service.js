const taskRepo = require('../repositories/task.repository');
const moduleRepo = require('../repositories/module.repository');
const { NotFoundError, ValidationError } = require('../utils/errors');

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const taskService = {
  async list(filters) {
    if (!filters.moduleId && !filters.assigneeId) {
      throw new ValidationError('module_id atau assignee_id wajib diisi');
    }
    return taskRepo.list(filters);
  },

  async getById(id) {
    const task = await taskRepo.findById(id);
    if (!task) throw new NotFoundError('Tugas tidak ditemukan');
    return task;
  },

  async create(data, userId) {
    const found = await moduleRepo.findById(data.module_id);
    if (!found) throw new NotFoundError('Modul tidak ditemukan');
    const payload = { ...data, created_by: userId };
    // Stamp completion date if created directly as done.
    payload.completed_at = data.status === 'done' ? todayISO() : null;
    return taskRepo.create(payload);
  },

  async update(id, data) {
    const patch = { ...data };
    // Keep completed_at in sync whenever status changes.
    if (data.status !== undefined) {
      patch.completed_at = data.status === 'done' ? todayISO() : null;
    }
    const updated = await taskRepo.update(id, patch);
    if (!updated) throw new NotFoundError('Tugas tidak ditemukan');
    return taskRepo.findById(id);
  },

  async remove(id) {
    const deleted = await taskRepo.remove(id);
    if (!deleted) throw new NotFoundError('Tugas tidak ditemukan');
  },
};

module.exports = taskService;
