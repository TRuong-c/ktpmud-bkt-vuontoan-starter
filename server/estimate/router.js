'use strict';
/**
 * Router bổ sung cho dạng `estimate` — gắn TRƯỚC router cũ trong server/index.js.
 *  - POST /api/submissions: chỉ xử lý bộ đề có câu `estimate`; mọi bộ đề khác gọi next()
 *    để router cũ (server/api.js) chạy nguyên trạng => không đổi hành vi 4 type cũ.
 *  - Chấm 100% trên server, tất định (rules.gradeEstimate). Lưu attempts/progress/sao
 *    đúng cùng cách router cũ để F5 không mất dữ liệu (B-05).
 * Không đụng server/auth.js (B-07): chỉ import requireAuth có sẵn.
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth, requireTeacher } = require('../auth');
const { KIND, computeParams, encodeAnswer, gradeEstimate, parseAnswer } = require('./rules');
const { seedEstimate } = require('./seed');

seedEstimate(db);

// Router được gắn ở GỐC (app.use) để vừa chấm bài vừa "đón" vài trang HTML mà KHÔNG sửa file cũ.
const router = express.Router();
const PUBLIC = path.join(__dirname, '..', '..', 'public');
const ENTRY_TAG = '<script src="assets/js/components/estimate-entry.js"></script>';

/* ---- Trang: giữ nguyên file cũ trên đĩa, chỉ chèn thêm 1 thẻ <script> khi gửi cho trình duyệt ---- */
function sendWithEntry(file) {
  return (req, res) => {
    let html = fs.readFileSync(path.join(PUBLIC, file), 'utf8');
    const i = html.lastIndexOf('</body>');
    html = i >= 0 ? html.slice(0, i) + ENTRY_TAG + '\n' + html.slice(i) : html + ENTRY_TAG;
    res.type('html').send(html);
  };
}
router.get(['/', '/index.html'], sendWithEntry('index.html'));
router.get(['/muc-luc.html', '/muc-luc', '/curriculum'], sendWithEntry('muc-luc.html'));
router.get(['/exercise.html', '/luyen-tap'], sendWithEntry('exercise.html'));
router.get(['/schedule.html', '/goc-thay-co'], sendWithEntry('schedule.html'));
router.get('/uoc-luong', (req, res) => res.sendFile(path.join(PUBLIC, 'estimate.html')));
router.get('/estimate-center.html', (req, res, next) => {
  if (req.user && req.user.role === 'teacher') return res.redirect('/estimate-teacher.html');
  return next();
});
router.get('/estimate-teacher.html', (req, res) => {
  if (!req.user) return res.redirect('/login.html?role=teacher');
  if (req.user.role !== 'teacher') return res.status(403).send('Trang này chỉ dành cho tài khoản giáo viên.');
  return res.sendFile(path.join(PUBLIC, 'estimate-teacher.html'));
});
// Bài 9 trên Trang chủ mở lesson.html?set=phieu-uoc-luong... -> đưa sang trang 2 bước thay vì ô điền số đơn.
router.get('/lesson.html', (req, res, next) => {
  const setId = String(req.query.set || '');
  const isEstimateSet = setId && db.prepare("SELECT 1 FROM questions WHERE set_id=? AND type='estimate' LIMIT 1").get(setId);
  if (!isEstimateSet) return next();
  res.sendFile(path.join(PUBLIC, 'estimate.html'));
});

/* ---------------- Khu giáo viên riêng cho bài Ước lượng ---------------- */
function estimateQuestionParams(prompt) {
  const clean = String(prompt || '').trim().replace(/[Xx]/g, '×');
  const match = clean.match(/^(\d+)\s*([×:]|÷)\s*(\d+)\s*=\s*\?$/);
  if (!match) throw new Error('Nhập phép tính theo mẫu 19 × 6 = ? hoặc 78 : 6 = ?');
  const a = Number(match[1]), b = Number(match[3]), operator = match[2];
  if (a > 999999999 || b > 9) throw new Error('Thừa số hoặc số chia cần phù hợp chương trình Toán lớp 3.');
  const kind = operator === ':' || operator === '÷'
    ? KIND.DIV
    : (a >= 10 ? KIND.MUL_2DIGIT : KIND.MUL_TABLE);
  const normalizedPrompt = `${a} ${kind === KIND.DIV ? ':' : '×'} ${b} = ?`;
  const answer = computeParams(kind, a, b);
  const width = kind === KIND.DIV ? 3 : 10;
  if (answer.max - answer.min < width) throw new Error(`Khoảng hợp lý của phép tính này hẹp hơn ${width} đơn vị, không dùng được với thanh trượt hiện tại.`);
  return { normalizedPrompt, answer, kind };
}

function ensureDivisionLesson(lessonId, kind) {
  if (kind !== KIND.DIV) return;
  const lesson = db.prepare('SELECT number FROM lessons WHERE id=?').get(lessonId);
  if (!lesson || Number(lesson.number) < 26) {
    throw new Error('Phép chia ước lượng chỉ được đặt từ Bài 26, sau khi học sinh đã học chia số có hai chữ số.');
  }
}

router.post('/api/teacher/estimate/sets/:setId/questions', requireTeacher, (req, res) => {
  try {
    const set = db.prepare('SELECT id, lesson_id FROM question_sets WHERE id=?').get(req.params.setId);
    if (!set) return res.status(404).json({ error: 'Không tìm thấy phiếu ước lượng.' });
    const existingTypes = db.prepare('SELECT DISTINCT type FROM questions WHERE set_id=?').all(set.id);
    if (existingTypes.some(row => row.type !== 'estimate')) {
      return res.status(409).json({ error: 'Phiếu này có câu hỏi loại khác. Hãy tạo phiếu Estimate riêng.' });
    }
    const { normalizedPrompt, answer, kind } = estimateQuestionParams(req.body && req.body.prompt);
    ensureDivisionLesson(set.lesson_id, kind);
    const points = Math.max(1, Math.min(100, Math.round(Number(req.body && req.body.points) || 5)));
    const category = String((req.body && req.body.category) || 'Ước lượng trước khi tính').trim().slice(0, 120);
    const maxSort = db.prepare('SELECT COALESCE(MAX(sort_order),0) AS m FROM questions WHERE set_id=?').get(set.id).m;
    const id = `est-${crypto.randomBytes(8).toString('hex')}`;
    db.prepare(`INSERT INTO questions (id,set_id,lesson_id,type,prompt,options_json,correct_answer,points,category,sort_order)
      VALUES (?,?,?,'estimate',?,NULL,?,?,?,?)`)
      .run(id, set.id, set.lesson_id, normalizedPrompt, encodeAnswer(answer), points, category, maxSort + 1);
    return res.status(201).json({ question: { id, prompt: normalizedPrompt, points, category } });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Không thể tạo câu hỏi ước lượng.' });
  }
});

router.put('/api/teacher/estimate/questions/:id', requireTeacher, (req, res) => {
  try {
    const question = db.prepare("SELECT id, set_id FROM questions WHERE id=? AND type='estimate'").get(req.params.id);
    if (!question) return res.status(404).json({ error: 'Không tìm thấy câu hỏi ước lượng.' });
    const set = db.prepare('SELECT lesson_id FROM question_sets WHERE id=?').get(question.set_id);
    const { normalizedPrompt, answer, kind } = estimateQuestionParams(req.body && req.body.prompt);
    ensureDivisionLesson(set && set.lesson_id, kind);
    const points = Math.max(1, Math.min(100, Math.round(Number(req.body && req.body.points) || 5)));
    const category = String((req.body && req.body.category) || 'Ước lượng trước khi tính').trim().slice(0, 120);
    db.prepare('UPDATE questions SET prompt=?,correct_answer=?,points=?,category=? WHERE id=? AND type=\'estimate\'')
      .run(normalizedPrompt, encodeAnswer(answer), points, category, question.id);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Không thể cập nhật câu hỏi ước lượng.' });
  }
});

router.delete('/api/teacher/estimate/questions/:id', requireTeacher, (req, res) => {
  const info = db.prepare("DELETE FROM questions WHERE id=? AND type='estimate'").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Không tìm thấy câu hỏi ước lượng.' });
  return res.json({ ok: true });
});

router.post('/api/teacher/estimate/assignments', requireTeacher, (req, res) => {
  const setId = String((req.body && req.body.setId) || '').trim();
  const set = db.prepare(`SELECT s.id FROM question_sets s
    WHERE s.id=? AND EXISTS (SELECT 1 FROM questions q WHERE q.set_id=s.id AND q.type='estimate')
      AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.set_id=s.id AND q.type<>'estimate')`).get(setId);
  if (!set) return res.status(404).json({ error: 'Hãy chọn một phiếu chỉ gồm câu hỏi Ước lượng.' });
  const className = String(req.user.class_name || '').trim();
  if (!className) return res.status(400).json({ error: 'Tài khoản giáo viên chưa được gắn với lớp.' });
  const dueDate = String((req.body && req.body.dueDate) || '').trim() || null;
  const note = String((req.body && req.body.note) || '').trim().slice(0, 500);
  db.prepare(`INSERT INTO assignments (set_id,class_name,due_date,note,created_by) VALUES (?,?,?,?,?)
    ON CONFLICT(set_id,class_name) DO UPDATE SET due_date=excluded.due_date,note=excluded.note,created_by=excluded.created_by,created_at=datetime('now','localtime')`)
    .run(set.id, className, dueDate, note, req.user.id);
  const assignment = db.prepare('SELECT id FROM assignments WHERE set_id=? AND class_name=?').get(set.id, className);
  return res.status(201).json({ assignment: { id: assignment.id, className } });
});

router.delete('/api/teacher/estimate/assignments/:id', requireTeacher, (req, res) => {
  const info = db.prepare(`DELETE FROM assignments WHERE id=? AND class_name=?
    AND set_id IN (SELECT set_id FROM questions WHERE type='estimate')`).run(req.params.id, req.user.class_name);
  if (!info.changes) return res.status(404).json({ error: 'Không tìm thấy phiếu đã giao cho lớp của bạn.' });
  return res.json({ ok: true });
});

function teacherEstimateSnapshot(className) {
  const students = db.prepare("SELECT id,username,full_name,class_name,total_stars FROM users WHERE role='student' AND is_active=1 AND class_name=? ORDER BY full_name").all(className);
  const sets = db.prepare(`SELECT DISTINCT s.id,s.title,s.lesson_id,l.number AS lesson_number
    FROM question_sets s JOIN questions q ON q.set_id=s.id AND q.type='estimate'
    LEFT JOIN lessons l ON l.id=s.lesson_id ORDER BY s.title`).all();
  const setIds = sets.map(set => set.id);
  const assignments = setIds.length ? db.prepare(`SELECT a.id,a.set_id,a.class_name,a.due_date,a.note,a.created_at,s.title AS set_title
    FROM assignments a JOIN question_sets s ON s.id=a.set_id
    WHERE a.class_name=? AND a.set_id IN (${setIds.map(() => '?').join(',')}) ORDER BY a.created_at DESC`).all(className, ...setIds) : [];
  const assignedSetIds = [...new Set(assignments.map(row => row.set_id))];
  const questionRows = assignedSetIds.length ? db.prepare(`SELECT * FROM questions WHERE type='estimate' AND set_id IN (${assignedSetIds.map(() => '?').join(',')}) ORDER BY sort_order`).all(...assignedSetIds) : [];
  const questionsBySet = new Map();
  questionRows.forEach(question => {
    if (!questionsBySet.has(question.set_id)) questionsBySet.set(question.set_id, []);
    questionsBySet.get(question.set_id).push(question);
  });
  const attempts = assignedSetIds.length ? db.prepare(`SELECT a.*,u.id AS student_id,u.full_name,u.username,u.total_stars
    FROM attempts a JOIN users u ON u.id=a.user_id
    WHERE u.role='student' AND u.is_active=1 AND u.class_name=? AND a.kind IN ('exercise','exam') AND a.ref_id IN (${assignedSetIds.map(() => '?').join(',')})
    ORDER BY a.created_at DESC,a.id DESC`).all(className, ...assignedSetIds) : [];
  const latest = new Map();
  const best = new Map();
  attempts.forEach(attempt => {
    const key = `${attempt.student_id}:${attempt.ref_id}`;
    if (!best.has(key) || attempt.score_percent > best.get(key)) best.set(key, attempt.score_percent);
    if (latest.has(key)) return;
    let answers = {};
    try { answers = JSON.parse(attempt.answers_json || '{}'); } catch { answers = {}; }
    const details = Array.isArray(answers.__estimateGrading)
      ? answers.__estimateGrading.filter(detail => detail.type === 'estimate')
      : (questionsBySet.get(attempt.ref_id) || []).map(question => gradeEstimate(question, answers[question.id]));
    latest.set(key, { attempt, answers, details });
  });
  const assignmentRows = assignments.map(assignment => {
    const records = students.map(student => latest.get(`${student.id}:${assignment.set_id}`)).filter(Boolean);
    const details = records.flatMap(record => record.details);
    const answered = details.length;
    const estimateWrong = details.filter(detail => !detail.estimateOk).length;
    const exactWrong = details.filter(detail => !detail.exactOk).length;
    return {
      ...assignment,
      total_students: students.length,
      done_students: records.length,
      best_score: records.length ? Math.max(...students.map(student => best.get(`${student.id}:${assignment.set_id}`) || 0)) : null,
      estimate_wrong_rate: answered ? Math.round(estimateWrong / answered * 100) : 0,
      exact_wrong_rate: answered ? Math.round(exactWrong / answered * 100) : 0,
      question_count: (questionsBySet.get(assignment.set_id) || []).length,
    };
  });
  const studentRows = students.map(student => {
    const assigned = assignmentRows.map(assignment => {
      const record = latest.get(`${student.id}:${assignment.set_id}`);
      return { assignmentId: assignment.id, setTitle: assignment.set_title, done: !!record, bestScore: best.get(`${student.id}:${assignment.set_id}`) ?? null };
    });
    const completedScores = assigned.filter(item => item.done).map(item => item.bestScore);
    return { ...student, assigned, completed: completedScores.length, best_score: completedScores.length ? Math.max(...completedScores) : null };
  });
  return { className, students: studentRows, sets, assignments: assignmentRows, latest, best, questionsBySet };
}

router.get('/api/teacher/estimate/overview', requireTeacher, (req, res) => {
  const snapshot = teacherEstimateSnapshot(String(req.user.class_name || ''));
  const assigned = snapshot.assignments.reduce((sum, assignment) => sum + assignment.total_students, 0);
  const done = snapshot.assignments.reduce((sum, assignment) => sum + assignment.done_students, 0);
  const scoreValues = snapshot.students.flatMap(student => student.assigned.filter(item => item.done).map(item => item.bestScore));
  res.json({
    className: snapshot.className,
    studentCount: snapshot.students.length,
    setCount: snapshot.sets.length,
    questionCount: snapshot.sets.reduce((sum, set) => sum + db.prepare("SELECT COUNT(*) AS c FROM questions WHERE set_id=? AND type='estimate'").get(set.id).c, 0),
    assignedCount: assigned,
    completedCount: done,
    completionRate: assigned ? Math.round(done / assigned * 100) : 0,
    bestScore: scoreValues.length ? Math.max(...scoreValues) : null,
    assignments: snapshot.assignments,
    students: snapshot.students,
    sets: snapshot.sets.map(set => ({ ...set, question_count: db.prepare("SELECT COUNT(*) AS c FROM questions WHERE set_id=? AND type='estimate'").get(set.id).c })),
  });
});

router.get('/api/teacher/estimate/students/:id/attempts', requireTeacher, (req, res) => {
  const student = db.prepare("SELECT id,full_name,username FROM users WHERE id=? AND role='student' AND is_active=1 AND class_name=?")
    .get(req.params.id, req.user.class_name);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh thuộc lớp của bạn.' });
  const rows = db.prepare(`SELECT a.id,a.ref_id,a.score_percent,a.created_at,a.answers_json,COALESCE(s.title,a.ref_id) AS set_title
    FROM attempts a LEFT JOIN question_sets s ON s.id=a.ref_id
    WHERE a.user_id=? AND a.kind IN ('exercise','exam')
      AND (EXISTS (SELECT 1 FROM questions q WHERE q.set_id=a.ref_id AND q.type='estimate')
        OR instr(a.answers_json,'"__estimateGrading"')>0)
    ORDER BY a.created_at DESC,a.id DESC`).all(student.id);
  const attempts = rows.map(row => {
    let answers = {};
    try { answers = JSON.parse(row.answers_json || '{}'); } catch { answers = {}; }
    const questions = db.prepare("SELECT * FROM questions WHERE set_id=? AND type='estimate' ORDER BY sort_order").all(row.ref_id);
    const entries = Array.isArray(answers.__estimateGrading)
      ? answers.__estimateGrading.filter(detail => detail.type === 'estimate')
      : questions.map(question => ({ ...gradeEstimate(question, answers[question.id]), prompt: question.prompt, given: answers[question.id] || {} }));
    return {
      id: row.id, setId: row.ref_id, setTitle: row.set_title, score: row.score_percent, createdAt: row.created_at,
      gradingBasis: Array.isArray(answers.__estimateGrading) ? 'saved' : 'current',
      questions: entries.map(graded => {
        const given = graded.given || {};
        return { id: graded.questionId, prompt: graded.prompt || 'Câu hỏi đã thay đổi', estimateMin: given.estimateMin ?? null,
          estimateMax: given.estimateMax ?? null, roundBefore: given.roundBefore ?? null,
          roundAfter: given.roundAfter ?? null, exactGiven: given.exact ?? null,
          estimateOk: graded.estimateOk, exactOk: graded.exactOk,
          correctRange: graded.acceptableRange, exactAnswer: graded.exactAnswer };
      }),
    };
  });
  return res.json({ student, bestScore: attempts.length ? Math.max(...attempts.map(attempt => attempt.score)) : null, attempts });
});

router.get('/api/teacher/estimate/report.csv', requireTeacher, (req, res) => {
  const snapshot = teacherEstimateSnapshot(String(req.user.class_name || ''));
  const separator = ';';
  const rows = [['Lớp', 'Tên học sinh', 'Tài khoản', 'Tổng sao', 'Phiếu', 'Đã nộp', 'Điểm cao nhất %',
    'Ước lượng đúng ở lượt mới nhất', 'Tính đúng ở lượt mới nhất'].map(value => `"${value}"`).join(separator)];
  snapshot.assignments.forEach(assignment => snapshot.students.forEach(student => {
    const record = snapshot.latest.get(`${student.id}:${assignment.set_id}`);
    const estimateRight = record ? record.details.filter(detail => detail.estimateOk).length : '';
    const exactRight = record ? record.details.filter(detail => detail.exactOk).length : '';
    const fields = [snapshot.className, student.full_name, student.username, student.total_stars, assignment.set_title,
      record ? 'Có' : 'Chưa', snapshot.best.get(`${student.id}:${assignment.set_id}`) ?? '', estimateRight, exactRight];
    rows.push(fields.map(value => `"${String(value == null ? '' : value).replace(/"/g, '""')}"`).join(separator));
  }));
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="bao-cao-uoc-luong-lop.csv"');
  // BOM giữ tiếng Việt; sep=; giúp Excel theo thiết lập vùng Việt Nam tách đúng từng cột.
  res.send(`\ufeffsep=;\r\n${rows.join('\r\n')}`);
});

router.post('/api/submissions', (req, res, next) => {
  const body = req.body || {};
  const setId = body.setId;
  if (typeof setId !== 'string') return next();
  const questions = db.prepare('SELECT * FROM questions WHERE set_id=? ORDER BY sort_order').all(setId);
  if (!questions.some(q => q.type === 'estimate')) return next(); // bộ đề cũ -> router cũ
  return requireAuth(req, res, () => handleEstimateSubmission(req, res, questions));
});

function handleEstimateSubmission(req, res, questions) {
  const { setId, durationSec = 0 } = req.body;
  const answers = req.body.answers && typeof req.body.answers === 'object' && !Array.isArray(req.body.answers)
    ? req.body.answers : {};
  const set = db.prepare('SELECT * FROM question_sets WHERE id=?').get(setId);
  if (!set) return res.status(400).json({ error: 'Bộ bài không hợp lệ.' });

  let earned = 0, max = 0, correct = 0;
  const detail = questions.map(q => {
    max += q.points;
    if (q.type === 'estimate') {
      const d = gradeEstimate(q, answers[q.id]);
      earned += d.earnedPoints;
      if (d.correct) correct++;
      return d;
    }
    // Câu loại cũ lẫn trong cùng bộ: chấm y hệt router cũ.
    const given = answers[q.id] == null ? '' : String(answers[q.id]).trim().toLowerCase();
    const ok = given === String(q.correct_answer).trim().toLowerCase();
    if (ok) { earned += q.points; correct++; }
    return { questionId: q.id, correct: ok, correctAnswer: q.correct_answer };
  });
  const percent = max ? Math.round((earned / max) * 100) : 0;

  const old = db.prepare('SELECT * FROM progress WHERE user_id=? AND lesson_id=?').get(req.user.id, set.lesson_id);
  const oldBest = old ? old.best_score : 0;
  const starsEarned = Math.round(Math.max(0, percent - oldBest) / 100 * set.star_reward);

  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO attempts (user_id,kind,ref_id,score_percent,correct_count,total_count,stars_earned,duration_sec,answers_json)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(req.user.id, set.kind, setId, percent, correct, questions.length, starsEarned, Number(durationSec) || 0,
      JSON.stringify({ ...answers, __estimateGrading: detail.map((graded, index) => ({
        ...graded, prompt: questions[index].prompt, given: answers[questions[index].id] || {},
      })).filter(graded => graded.type === 'estimate') }));
    db.prepare(`INSERT INTO progress (user_id,lesson_id,best_score,completed,updated_at) VALUES (?,?,?,?,datetime('now','localtime'))
      ON CONFLICT(user_id,lesson_id) DO UPDATE SET best_score=MAX(best_score,excluded.best_score),
        completed=MAX(completed,excluded.completed), updated_at=datetime('now','localtime')`)
      .run(req.user.id, set.lesson_id, percent, percent >= 50 ? 1 : 0);
    if (starsEarned) db.prepare('UPDATE users SET total_stars=total_stars+? WHERE id=?').run(starsEarned, req.user.id);
  });
  tx();
  const me = db.prepare('SELECT total_stars FROM users WHERE id=?').get(req.user.id);
  res.json({ scorePercent: percent, correctCount: correct, totalCount: questions.length, starsEarned, totalStars: me.total_stars, detail });
}

module.exports = router;
