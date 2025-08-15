import { query } from '../config/db.js';

export const User = {
  async all() {
    return query('SELECT id, name, email, created_at FROM users ORDER BY id DESC');
  },
  async find(id) {
    const rows = await query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async create({ name, email }) {
    const result = await query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
    return { id: result.insertId, name, email };
  },
  async destroy(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
  }
};
