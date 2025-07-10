const fs = require('fs');
const mysql = require('mysql2/promise');

async function resetDB() {
  // Koneksi tanpa database dulu
  const dbNoDB = await mysql.createConnection({
    host: 'localhost',
    user: 'root', // ganti sesuai user MySQL Anda
    password: '' // ganti jika ada password
  });

  // Buat database jika belum ada
  await dbNoDB.query('CREATE DATABASE IF NOT EXISTS emodetc');
  await dbNoDB.end();

  // Koneksi ke database emodetc
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'emodetc'
  });

  // Nonaktifkan foreign key checks sementara
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  // Drop dengan urutan yang benar agar tidak error FK
  await db.query('DROP TABLE IF EXISTS emotion_stats');
  await db.query('DROP TABLE IF EXISTS room_members');
  await db.query('DROP TABLE IF EXISTS messages');
  await db.query('DROP TABLE IF EXISTS rooms');
  await db.query('DROP TABLE IF EXISTS users');
  await db.query('SET FOREIGN_KEY_CHECKS = 1');

  // Jalankan ulang schema.sql, satu per satu (skip CREATE DATABASE/USE)
  const schema = fs.readFileSync('schema.sql', 'utf8');
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s =>
      s &&
      !s.startsWith('--') &&
      !s.toUpperCase().startsWith('CREATE DATABASE') &&
      !s.toUpperCase().startsWith('USE ') &&
      !s.toUpperCase().startsWith('CREATE TABLE IF NOT EXISTS MESSAGES')
    );
  for (const stmt of statements) {
    try {
      await db.query(stmt);
    } catch (err) {
      console.error('Error saat menjalankan statement SQL:', stmt);
      console.error(err);
      throw err;
    }
  }

  console.log('Database reset & migrate selesai!');
  await db.end();
}

resetDB();
