'use strict';
/**
 * Nạp bộ đề ước lượng vào SQLite (B-02). Idempotent: chạy bao nhiêu lần cũng được,
 * chạy được cả trên DB cũ lẫn DB mới (sau `npm run reset-db && npm start`).
 * Không ALTER TABLE, không đụng dữ liệu cũ (ADR-001).
 */
const { SET_ID, SET_TITLE, SET_LESSON_ID, buildQuestionRows } = require('./fixtures');
const { KIND, computeParams, encodeAnswer } = require('./rules');

// Câu estimate do giáo viên tạo từ phiên bản thuật toán cũ cũng phải dùng cùng quy tắc mới.
function refreshExistingEstimateAnswers(db) {
  const questions = db.prepare("SELECT id, prompt FROM questions WHERE type='estimate'").all();
  const update = db.prepare("UPDATE questions SET correct_answer=? WHERE id=? AND type='estimate'");
  for (const question of questions) {
    const match = String(question.prompt || '').match(/(\d+)\s*([×x:]|÷)\s*(\d+)\s*=\s*\?/i);
    if (!match) continue;
    const a = Number(match[1]), b = Number(match[3]);
    const kind = match[2] === ':' || match[2] === '÷'
      ? KIND.DIV
      : (a >= 10 ? KIND.MUL_2DIGIT : KIND.MUL_TABLE);
    try {
      update.run(encodeAnswer(computeParams(kind, a, b)), question.id);
    } catch (_) {
      // Đề cũ ngoài quy tắc hiện hành được giữ nguyên để giáo viên có thể kiểm tra/sửa.
    }
  }
}

function seedEstimate(db) {
  const lesson = db.prepare('SELECT id FROM lessons WHERE id=?').get(SET_LESSON_ID);
  if (!lesson) return { inserted: 0, skipped: true }; // DB chưa có bài học nền -> không nạp

  const rows = buildQuestionRows();
  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO question_sets (id,title,kind,lesson_id,star_reward,duration_minutes)
      VALUES (?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET lesson_id=excluded.lesson_id`).run(SET_ID, SET_TITLE, 'exercise', SET_LESSON_ID, 40, 0);
    const up = db.prepare(`INSERT INTO questions (id,set_id,lesson_id,type,prompt,options_json,correct_answer,points,category,sort_order)
      VALUES (@id,@setId,@lessonId,@type,@prompt,@optionsJson,@correctAnswer,@points,@category,@sortOrder)
      ON CONFLICT(id) DO UPDATE SET set_id=excluded.set_id, lesson_id=excluded.lesson_id, type=excluded.type,
        prompt=excluded.prompt, options_json=excluded.options_json, correct_answer=excluded.correct_answer,
        points=excluded.points, category=excluded.category, sort_order=excluded.sort_order`);
    rows.forEach(r => up.run(r));
    refreshExistingEstimateAnswers(db);
  });
  tx();
  return { inserted: rows.length, skipped: false };
}

module.exports = { seedEstimate };
