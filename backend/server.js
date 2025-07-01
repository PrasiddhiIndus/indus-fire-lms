// ✅ FIRST: Require dotenv and load environment variables
import { config } from 'dotenv';
config();

// ✅ THEN: Import other required modules
import express, { json } from 'express';
import cors from 'cors';
import { Pool } from 'pg';

// ✅ Create express app
const app = express();

// ✅ Middleware
app.use(cors());
app.use(json());

// ✅ PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
});

// ✅ POST endpoint to submit exam
app.post('/submit-exam', async (req, res) => {
  console.log("🔵 Incoming Data:", req.body); // <-- ADD THIS LINE

  const {
    user_id, user_name, course_id,
    course_title, chapter_id, chapter_title,
    score, timestamp
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO exam_submissions 
       (user_id, user_name, course_id, course_title, chapter_id, chapter_title, score, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [user_id, user_name, course_id, course_title, chapter_id, chapter_title, score, timestamp]
    );
    res.status(200).send('✅ Submission stored successfully');
  } catch (err) {
    console.error('❌ DB Insert Error:', err.message);
    res.status(500).send('❌ Failed to save submission');
  }
});

// ✅ GET endpoint to fetch submissions
app.get('/submissions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exam_submissions ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send('❌ Error fetching submissions');
  }
});

// ✅ Start server
app.listen(process.env.PORT, () => {
  console.log(`✅ Server running at http://localhost:${process.env.PORT}`);
});
