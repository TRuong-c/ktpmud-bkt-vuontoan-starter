'use strict';
// Tầng 1 — Unit test hàm thuần (B-03, B-06, B-08): normal / boundary / invalid / scoring.
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../server/estimate/rules');
const { SPECS, buildQuestionRows } = require('../server/estimate/fixtures');

const Q = { id: 'est-5', points: 10, prompt: '19 × 6 = ?', correct_answer: JSON.stringify({ min: 110, max: 120, canonical: 120, exact: 114 }) };
const g = (left, exact) => R.gradeEstimate(Q, {
  roundBefore: '19', roundAfter: '20', estimateMin: left,
  estimateMax: String(Number(left) + 10), exact,
});

test('computeParams: 3 loại câu theo ADR-002', () => {
  assert.deepEqual(R.computeParams(R.KIND.MUL_TABLE, 6, 7), { min: 40, max: 50, canonical: 40, exact: 42 });
  assert.deepEqual(R.computeParams(R.KIND.MUL_TABLE, 6, 8), { min: 40, max: 50, canonical: 50, exact: 48 });
  assert.deepEqual(R.computeParams(R.KIND.MUL_2DIGIT, 19, 6), { min: 110, max: 120, canonical: 120, exact: 114 });
  assert.deepEqual(R.computeParams(R.KIND.MUL_2DIGIT, 29, 7), { min: 200, max: 210, canonical: 210, exact: 203 });
  assert.deepEqual(R.computeParams(R.KIND.DIV, 78, 6), { min: 12, max: 15, canonical: 15, exact: 13 });
  assert.deepEqual(R.computeParams(R.KIND.DIV, 98, 7), { min: 12, max: 15, canonical: 15, exact: 14 });
  assert.deepEqual(R.computeParams(R.KIND.DIV, 99, 9), { min: 10, max: 13, canonical: 10, exact: 11 });
  assert.deepEqual(R.computeParams(R.KIND.DIV, 66, 6), { min: 10, max: 13, canonical: 10, exact: 11 });
  assert.deepEqual(R.computeParams(R.KIND.DIV, 96, 6), { min: 15, max: 18, canonical: 15, exact: 16 });
});

test('computeParams: từ chối đầu vào sai', () => {
  assert.throws(() => R.computeParams(R.KIND.DIV, 79, 6), RangeError);
  assert.throws(() => R.computeParams(R.KIND.DIV, 48, 4), RangeError);
  assert.throws(() => R.computeParams(R.KIND.DIV, 54, 6), RangeError); // thương nhỏ hơn 10
  assert.throws(() => R.computeParams('khac', 1, 1), RangeError);
  assert.throws(() => R.computeParams(R.KIND.MUL_TABLE, 0, 5), RangeError);
});

test('TC-SEED: 12 fixture khớp bảng REQUIREMENTS §5 và đúng bất biến', () => {
  assert.ok(SPECS.length >= 12);
  const expected = {
    'est-1': [40, 50, 40, 42], 'est-2': [40, 50, 50, 48], 'est-3': [50, 60, 60, 56], 'est-4': [60, 70, 60, 63],
    'est-5': [110, 120, 120, 114], 'est-6': [120, 130, 120, 126], 'est-7': [200, 210, 210, 203], 'est-8': [240, 250, 240, 248],
    'est-9': [12, 15, 15, 13], 'est-10': [12, 15, 15, 14], 'est-11': [140, 160, 160, 144], 'est-12': [10, 13, 10, 11],
  };
  for (const r of buildQuestionRows()) {
    const p = R.parseAnswer(r.correctAnswer); // ném lỗi nếu sai bất biến
    assert.ok(p.min <= p.canonical && p.canonical <= p.max && p.exact > 0, r.id);
    assert.deepEqual([p.min, p.max, p.canonical, p.exact], expected[r.id], r.id);
  }
});

test('Normal: dải 110–120 được điểm tối đa', () => {
  for (const [u, v] of [['110', '114'], [' 110 ', ' 114 '], [110, 114]]) {
    const d = g(u, v);
    assert.deepEqual([d.estimateOk, d.exactOk, d.correct, d.earnedPoints], [true, true, true, 10]);
  }
});

test('TC-NORM-05: tất định (100 lần giống nhau)', () => {
  const first = JSON.stringify(g('110', '114'));
  for (let i = 0; i < 100; i++) assert.equal(JSON.stringify(g('110', '114')), first);
});

test('Boundary: dải phải rộng 10 và nằm trọn trong 110–120', () => {
  assert.equal(g('110', '114').estimateOk, true);
  assert.equal(g('120', '114').estimateOk, false);
  assert.equal(g('109', '114').estimateOk, false);
  assert.equal(g('121', '114').estimateOk, false);
  assert.equal(g('110', '113').exactOk, false);
  assert.equal(g('110', '115').exactOk, false);
  assert.deepEqual([g('0', '114').estimateOk, g('0', '114').exactOk], [false, true]);
});

test('Invalid input: không crash, không nhận "115abc", "115.5", "-115", biểu thức', () => {
  assert.deepEqual([g('', '').estimateOk, g('', '').exactOk, g('', '').correct], [false, false, false]);
  assert.deepEqual([g('   ', '114').estimateOk, g('   ', '114').exactOk], [false, true]);
  for (const bad of [null, undefined, 'abc', 42, [], ['120']]) {
    const d = R.gradeEstimate(Q, bad);
    assert.deepEqual([d.estimateOk, d.exactOk, d.correct, d.earnedPoints], [false, false, false, 0]);
  }
  assert.equal(g('một trăm', 'abc').estimateOk, false);
  assert.equal(g('115abc', '114').estimateOk, false);
  assert.equal(g('115.5', '114').estimateOk, false);
  assert.equal(g('114.0', '114.0').exactOk, false);
  assert.equal(g('-115', '114').estimateOk, false);
  assert.deepEqual([g('20*6', 'Infinity').estimateOk, g('20*6', 'Infinity').exactOk], [false, false]);
  assert.equal(g('NaN', 'NaN').exactOk, false);
  const partial = R.gradeEstimate(Q, { estimate: '120' });
  assert.deepEqual([partial.estimateOk, partial.exactOk, partial.correct], [false, false, false]);
});

test('Scoring: ma trận 4 trạng thái + tình huống u === exact', () => {
  const s1 = g('110', '114'), s2 = g('110', '110'), s3 = g('90', '114'), s4 = g('90', '100');
  assert.deepEqual([s1.correct, s1.earnedPoints], [true, 10]);
  assert.deepEqual([s2.estimateOk, s2.exactOk, s2.correct, s2.earnedPoints], [true, false, false, 5]);
  assert.deepEqual([s3.estimateOk, s3.exactOk, s3.correct, s3.earnedPoints], [false, true, false, 5]);
  assert.deepEqual([s4.estimateOk, s4.exactOk, s4.correct, s4.earnedPoints], [false, false, false, 0]);
  assert.notEqual(s2.feedback, s3.feedback); // B-06: feedback phân biệt hai bước
  assert.notEqual(s3.feedback, s4.feedback);
  const s5 = R.gradeEstimate(Q, { estimate: '114', exact: '114' });
  assert.deepEqual([s5.estimateOk, s5.exactOk, s5.correct, s5.earnedPoints], [false, true, false, 5]);
});

test('Ước lượng nhân số hai chữ số chấm dải kéo nằm trọn trong khoảng hợp lý', () => {
  const question = { id: 'sample', points: 10, prompt: '29 × 6 = ?', correct_answer: JSON.stringify({ min: 170, max: 180, canonical: 180, exact: 174 }) };
  const right = R.gradeEstimate(question, { roundBefore: '29', roundAfter: '30', estimateMin: '170', estimateMax: '180', exact: '174' });
  assert.deepEqual([right.estimateOk, right.exactOk, right.correct], [true, true, true]);
  const shifted = R.gradeEstimate(question, { roundBefore: '29', roundAfter: '30', estimateMin: '175', estimateMax: '185', exact: '174' });
  assert.deepEqual([shifted.estimateOk, shifted.exactOk], [false, true]);
  const exactCopiedIntoEstimate = R.gradeEstimate(question, { roundBefore: '29', roundAfter: '30', estimate: '174', exact: '174' });
  assert.deepEqual([exactCopiedIntoEstimate.estimateOk, exactCopiedIntoEstimate.exactOk], [false, true]);
  const wrongRounding = R.gradeEstimate(question, { roundBefore: '29', roundAfter: '29', estimateMin: '170', estimateMax: '180', exact: '174' });
  assert.equal(wrongRounding.estimateOk, false);
});

test('Phép chia 78 : 6 chỉ chấp nhận dải 12–15 rộng 3 đơn vị', () => {
  const question = { id: 'division', points: 10, prompt: '78 : 6 = ?', correct_answer: JSON.stringify({ min: 12, max: 15, canonical: 15, exact: 13 }) };
  assert.equal(R.gradeEstimate(question, { estimateMin: '12', estimateMax: '15', exact: '13' }).correct, true);
  assert.equal(R.gradeEstimate(question, { estimateMin: '12', estimateMax: '14', exact: '13' }).estimateOk, false);
  assert.equal(R.gradeEstimate(question, { estimateMin: '13', estimateMax: '15', exact: '13' }).estimateOk, false);
  assert.equal(R.gradeEstimate(question, { estimateMin: '11', estimateMax: '13', exact: '13' }).estimateOk, false);
  assert.equal(R.gradeEstimate(question, { estimateMin: '14', estimateMax: '16', exact: '13' }).estimateOk, false);
  assert.equal(R.gradeEstimate(question, { estimateMin: '11', estimateMax: '15', exact: '13' }).estimateOk, false);
});

test('parseAnswer: từ chối định dạng cũ "75-85|81" và JSON thiếu trường', () => {
  assert.throws(() => R.parseAnswer('75-85|81'));
  assert.throws(() => R.parseAnswer('{"min":1,"max":2}'));
  assert.throws(() => R.parseAnswer('{"min":10,"max":5,"canonical":7,"exact":7}'));
});
