'use strict';
// Tầng UI/Static + phục vụ trang (B-08, B-09, B-10): kiểm tra lối vào, trợ năng và việc
// router chỉ CHÈN thêm thẻ script khi gửi trang, không sửa file HTML cũ trên đĩa.
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const DB_FILE = path.join(os.tmpdir(), `vuon-toan-ui-${process.pid}.db`);
process.env.DB_PATH = DB_FILE;

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const db = require('../server/db');
const { attachUser } = require('../server/auth');
const { SET_ID } = require('../server/estimate/fixtures');

const PUBLIC = path.join(__dirname, '..', 'public');
const read = f => fs.readFileSync(path.join(PUBLIC, f), 'utf8');

let server, base;
before(async () => {
  const app = express();
  app.use(express.json());
  app.use(attachUser(db));
  app.use(require('../server/estimate/router'));
  app.use('/api', require('../server/api'));
  app.use(express.static(PUBLIC));
  await new Promise(r => { server = app.listen(0, '127.0.0.1', r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => {
  server.close();
  db.close();
  for (const f of [DB_FILE, DB_FILE + '-wal', DB_FILE + '-shm']) fs.rmSync(f, { force: true });
});

const getText = async url => {
  const res = await fetch(base + url);
  return { status: res.status, text: await res.text() };
};

test('Trang estimate có đủ 2 bước, ví dụ minh hoạ và liên kết hướng dẫn', () => {
  const html = read('estimate.html');
  for (const text of [
    'Bước 1 — Ước lượng',
    'Bước 2 — Tính đúng',
    'Ví dụ cách làm',
    'estimate-guide.html',
    'Xem hướng dẫn cách làm',
    'aria-live',
    'role="progressbar"',
  ]) assert.ok(html.includes(text), `estimate.html thiếu: ${text}`);
  // Ví dụ minh hoạ không được trùng đề trong phiếu (tránh lộ đáp án).
  assert.ok(!/6\s*×\s*7|19\s*×\s*6/.test(html));
});

test('Trang hướng dẫn công khai cách chấm nhưng không chứa đáp án fixture', () => {
  const html = read('estimate-guide.html');
  for (const text of ['Cách chấm điểm', '100%', '50%', 'Dùng bàn phím', 'Dành cho giáo viên']) {
    assert.ok(html.includes(text), `estimate-guide.html thiếu: ${text}`);
  }
  assert.ok(!/correct_answer|allowedRange|exactAnswer/.test(html));
  // Hướng dẫn thao tác kéo khoảng mà không in đáp án phép tính ra trước bài.
  assert.ok(html.includes('khoảng rộng 10 đơn vị'));
  assert.ok(html.includes('khoảng rộng 2 đơn vị'));
  assert.ok(!html.includes('29 × 6 = 174'));
  assert.ok(!html.includes('30 × 6 = 180'));
  assert.ok(!/6\s*×\s*7|19\s*×\s*6|78\s*:\s*6/.test(html));
});

test('JS trang estimate: bàn phím, aria-invalid và không nhúng đáp án', () => {
  const js = read('assets/js/pages/estimate.js');
  for (const text of ["e.key === 'Tab'", "e.key === 'Enter'", 'aria-invalid', 'mathapp:user-ready', 'syncStep', 'aria-valuenow', 'roundBefore', 'roundAfter', 'type="range"', 'data-estimate-ticks']) {
    assert.ok(js.includes(text), `estimate.js thiếu: ${text}`);
  }
  // Đáp án chỉ nằm ở server; trình duyệt không được chứa khoảng chấm.
  assert.ok(!/correct_answer|acceptableRange\s*:\s*\{/.test(js));
});

test('Thẻ lối vào đổi nội dung theo vai trò và luôn có link hướng dẫn', () => {
  const js = read('assets/js/components/estimate-entry.js');
  for (const text of ['estimate-center.html', 'estimate-teacher.html', 'estimate-guide.html', 'requireRole', 'schedule', 'giáo viên']) {
    assert.ok(js.includes(text), `estimate-entry.js thiếu: ${text}`);
  }
});

test('Router chỉ chèn thẻ vào bản gửi đi, file HTML cũ trên đĩa giữ nguyên', () => {
  for (const f of ['index.html', 'muc-luc.html', 'exercise.html', 'schedule.html']) {
    assert.ok(!read(f).includes('estimate-entry.js'), `${f} trên đĩa không được sửa`);
  }
});

test('HTTP: các trang quen thuộc đều nhận thẻ lối vào', async () => {
  for (const url of ['/', '/index.html', '/muc-luc.html', '/exercise.html', '/schedule.html']) {
    const r = await getText(url);
    assert.equal(r.status, 200, url);
    assert.ok(r.text.includes('assets/js/components/estimate-entry.js'), `${url} thiếu thẻ lối vào`);
    assert.ok(r.text.includes('<main'), `${url} phải còn nội dung gốc`);
  }
});

test('HTTP: trang luyện và trang hướng dẫn được phục vụ đúng', async () => {
  const est = await getText('/estimate.html');
  assert.equal(est.status, 200);
  assert.ok(est.text.includes('assets/js/pages/estimate.js'));

  const center = await getText('/estimate-center.html');
  assert.equal(center.status, 200);
  assert.ok(center.text.includes('Bắt đầu luyện tập'));

  const guide = await getText('/estimate-guide.html');
  assert.equal(guide.status, 200);
  assert.ok(guide.text.includes('Cách làm bài'));
  assert.ok(!guide.text.includes('assets/js/pages/estimate.js'));

  const alias = await getText('/uoc-luong');
  assert.equal(alias.status, 200);
  assert.ok(alias.text.includes('assets/js/pages/estimate.js'));
});

test('HTTP: /lesson.html?set=phieu-uoc-luong... mở trang 2 bước, set khác giữ trang cũ', async () => {
  const est = await getText('/lesson.html?set=' + SET_ID);
  assert.equal(est.status, 200);
  assert.ok(est.text.includes('assets/js/pages/estimate.js'));

  const old = await getText('/lesson.html?set=phieu-bai-9-10');
  assert.equal(old.status, 200);
  assert.ok(!old.text.includes('assets/js/pages/estimate.js'));
  assert.ok(old.text.includes('assets/js/pages/lesson.js'));
});
