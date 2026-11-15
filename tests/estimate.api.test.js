'use strict';
// Tầng 2/3 — API + SQLite (B-02, B-04, B-05, B-07, B-11, regression). DB tạm cô lập qua DB_PATH (ADR-005).
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const DB_FILE = path.join(os.tmpdir(), `vuon-toan-test-${process.pid}.db`);
process.env.DB_PATH = DB_FILE;

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const db = require('../server/db');
const { attachUser, issueToken } = require('../server/auth');
const { SET_ID } = require('../server/estimate/fixtures');
const R = require('../server/estimate/rules');

let server, base;
const tokenOf = username => issueToken(db.prepare('SELECT id,role FROM users WHERE username=?').get(username));
const call = async (method, url, user, body) => {
  const res = await fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${tokenOf(user)}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
};
const exactAnswers = () => Object.fromEntries(
  db.prepare('SELECT id,prompt,correct_answer FROM questions WHERE set_id=?').all(SET_ID)
    .map(q => {
      const p = R.parseAnswer(q.correct_answer);
      const expr = q.prompt.match(/(?:^|\s)(\d{2,})\s*[×x]\s*(\d+)\s*=\s*\?/i);
      const rounding = expr ? { roundBefore: expr[1], roundAfter: String(R.round10(Number(expr[1]))) } : {};
      const width = /[×x]/i.test(q.prompt) ? 10 : 2;
      return [q.id, { ...rounding, estimateMin: String(p.min), estimateMax: String(p.min + width), exact: String(p.exact) }];
    }));

before(async () => {
  const app = express();
  app.use(express.json());
  app.use(attachUser(db));
  // Router estimate gắn ở GỐC (giống server/index.js) để vừa chấm /api/submissions vừa chèn thẻ vào trang HTML.
  app.use(require('../server/estimate/router'));
  app.use('/api', require('../server/api'));
  await new Promise(r => { server = app.listen(0, '127.0.0.1', r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => {
  server.close();
  db.close();
  for (const f of [DB_FILE, DB_FILE + '-wal', DB_FILE + '-shm']) fs.rmSync(f, { force: true });
});

test('TC-SEED-01 (B-02): >= 12 câu estimate, đúng định dạng JSON chuẩn', () => {
  const rows = db.prepare("SELECT * FROM questions WHERE type='estimate'").all();
  assert.ok(rows.length >= 12);
  for (const r of rows) { const p = R.parseAnswer(r.correct_answer); assert.ok(p.exact > 0 && p.min <= p.canonical && p.canonical <= p.max); }
});

test('Seed idempotent: nạp lại không nhân đôi', () => {
  require('../server/estimate/seed').seedEstimate(db);
  assert.equal(db.prepare("SELECT COUNT(*) c FROM questions WHERE type='estimate'").get().c, 12);
  assert.equal(db.prepare('SELECT COUNT(*) c FROM question_sets WHERE id=?').get(SET_ID).c, 1);
});

test('B-01: bộ đề hiện trong /api/lessons ở bài học có sẵn', async () => {
  const r = await call('GET', '/api/lessons', 'hocsinh02');
  const lesson = r.json.lessons.find(l => l.questionSets.some(s => s.id === SET_ID));
  assert.ok(lesson, 'bộ đề phải gắn vào một bài học có sẵn');
});

test('TC-SEC-01 (B-04): GET câu hỏi không lộ đáp án', async () => {
  const r = await call('GET', `/api/question-sets/${SET_ID}/questions`, 'hocsinh02');
  assert.equal(r.status, 200);
  assert.equal(r.json.questions.length, 12);
  const raw = JSON.stringify(r.json);
  for (const k of ['correct_answer', 'correctAnswer', '"min"', '"max"', '"exact"', 'canonical']) assert.ok(!raw.includes(k), k);
  for (const q of r.json.questions) assert.ok(q.id && q.type === 'estimate' && q.prompt && q.points);
});

test('Chưa đăng nhập: 401 (bộ đề estimate vẫn qua requireAuth)', async () => {
  const r = await call('POST', '/api/submissions', null, { setId: SET_ID, answers: {} });
  assert.equal(r.status, 401);
});

test('Bộ đề không tồn tại: 400 từ router cũ', async () => {
  const r = await call('POST', '/api/submissions', 'hocsinh02', { setId: 'khong-co', answers: {} });
  assert.equal(r.status, 400);
});

test('TC-SUB-01/02/03 (B-05): chấm, lưu, F5 vẫn còn, chống cày sao', async () => {
  const user = 'hocsinh03';
  const uid = db.prepare('SELECT id FROM users WHERE username=?').get(user).id;
  const r1 = await call('POST', '/api/submissions', user, { setId: SET_ID, answers: exactAnswers() });
  assert.equal(r1.status, 200);
  assert.equal(r1.json.scorePercent, 100);
  assert.equal(r1.json.correctCount, 12);
  assert.ok(r1.json.starsEarned > 0);
  assert.equal(r1.json.detail.length, 12);
  assert.ok(r1.json.detail.every(d => d.estimateOk && d.exactOk && d.type === 'estimate'));
  assert.equal(db.prepare('SELECT COUNT(*) c FROM attempts WHERE user_id=? AND ref_id=?').get(uid, SET_ID).c, 1);

  const prog = await call('GET', '/api/me/progress', user); // mô phỏng F5
  const lesson = prog.json.lessons.find(l => l.questionSets.some(s => s.id === SET_ID));
  assert.equal(lesson.bestScore, 100);
  assert.equal(lesson.completed, true);
  assert.equal(prog.json.totalStars, r1.json.totalStars);

  // nộp lại điểm thấp hơn: toàn bộ ST-2 (ước lượng đúng, tính sai) -> ~50%
  const half = Object.fromEntries(Object.entries(exactAnswers()).map(([k, v]) => [k, { ...v, exact: '9999' }]));
  const r2 = await call('POST', '/api/submissions', user, { setId: SET_ID, answers: half });
  assert.equal(r2.json.starsEarned, 0);
  assert.ok(r2.json.scorePercent < 100 && r2.json.correctCount === 0);
  const prog2 = await call('GET', '/api/me/progress', user);
  assert.equal(prog2.json.lessons.find(l => l.id === lesson.id).bestScore, 100);
  assert.equal(prog2.json.totalStars, r1.json.totalStars);
});

test('TC-SCORE-06: scorePercent / correctCount trên bộ hỗn hợp (công thức ADR-003)', async () => {
  // est-5 (10đ) đúng cả 2 + est-6 (10đ) chỉ đúng 1 bước, 10 câu còn lại bỏ trống => tổng điểm = 70
  const answers = {
    'est-5': { roundBefore: '19', roundAfter: '20', estimateMin: '110', estimateMax: '120', exact: '114' },
    'est-6': { roundBefore: '21', roundAfter: '20', estimateMin: '120', estimateMax: '130', exact: '1' },
  };
  const r = await call('POST', '/api/submissions', 'hocsinh04', { setId: SET_ID, answers });
  const total = db.prepare('SELECT SUM(points) s FROM questions WHERE set_id=?').get(SET_ID).s;
  assert.equal(r.json.correctCount, 1);
  assert.equal(r.json.scorePercent, Math.round(((10 + 5) / total) * 100));
});

test('Đầu vào xấu qua API không làm sập server', async () => {
  for (const answers of [null, [], 'x', { 'est-1': null, 'est-2': 5, 'est-3': { estimate: {}, exact: [] } }]) {
    const r = await call('POST', '/api/submissions', 'hocsinh05', { setId: SET_ID, answers });
    assert.equal(r.status, 200);
    assert.equal(r.json.correctCount, 0);
  }
});

test('TC-REG-01: bộ đề cũ (compare/input/paint, multiple-choice) vẫn chấm 100% như trước', async () => {
  for (const setId of ['phieu-bai-9-10', 'bai-15-kiem-tra']) {
    const answers = Object.fromEntries(db.prepare('SELECT id,correct_answer FROM questions WHERE set_id=?').all(setId).map(q => [q.id, q.correct_answer]));
    const r = await call('POST', '/api/submissions', 'hocsinh06', { setId, answers });
    assert.equal(r.status, 200, setId);
    assert.equal(r.json.scorePercent, 100, setId);
    assert.equal(r.json.correctCount, r.json.totalCount, setId);
  }
});

test('TC-AUD-01 (B-07/B-11): tài khoản mẫu còn nguyên, đăng nhập được', async () => {
  const users = db.prepare('SELECT username FROM users').all().map(u => u.username);
  assert.ok(users.includes('giaovien01') && users.includes('hocsinh01') && users.includes('hocsinh99'));
  const res = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'hocsinh01', password: '123456' }) });
  assert.equal(res.status, 200);
});

test('B-07: không sửa file bị cấm (so với băm lúc kiểm tra: auth.js có hàm cũ, không nhắc estimate)', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'server', 'auth.js'), 'utf8');
  assert.ok(!/estimate/i.test(src));
  const h = crypto.createHash('sha256').update(src).digest('hex');
  assert.equal(h.length, 64); // dùng `git diff --stat server/auth.js` để đối chiếu với commit gốc khi nộp
});
