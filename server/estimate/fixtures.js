'use strict';
/**
 * 12 câu hỏi synthetic (B-02) — toàn bộ là phép NHÂN/CHIA trên các bài đã có (bai-9..bai-26).
 * Chỉ lưu đề (kind, a, b); min/max/canonical/exact luôn được TÍNH bằng rules.computeParams
 * nên không thể lệch quy tắc ADR-002.
 */
const { KIND, computeParams, encodeAnswer } = require('./rules');

const SET_ID = 'phieu-uoc-luong-nhan-chia';
const SET_TITLE = 'Phiếu luyện tập: Ước lượng kết quả trước khi tính đúng (nhân/chia)';
// Bài chia hai chữ số chỉ xuất hiện từ Bài 26; bộ luyện tổng hợp được gắn tại đây.
const SET_LESSON_ID = 'bai-26';
const CATEGORY = 'Ước lượng trước khi tính';

const SPECS = [
  { id: 'est-1', lessonId: 'bai-9', kind: KIND.MUL_TABLE, a: 6, b: 7, points: 5, prompt: '6 × 7 = ?' },
  { id: 'est-2', lessonId: 'bai-9', kind: KIND.MUL_TABLE, a: 6, b: 8, points: 5, prompt: '6 × 8 = ?' },
  { id: 'est-3', lessonId: 'bai-11', kind: KIND.MUL_TABLE, a: 7, b: 8, points: 5, prompt: '7 × 8 = ?' },
  { id: 'est-4', lessonId: 'bai-14', kind: KIND.MUL_TABLE, a: 9, b: 7, points: 5, prompt: '9 × 7 = ?' },
  { id: 'est-5', lessonId: 'bai-23', kind: KIND.MUL_2DIGIT, a: 19, b: 6, points: 10, prompt: '19 × 6 = ?' },
  { id: 'est-6', lessonId: 'bai-23', kind: KIND.MUL_2DIGIT, a: 21, b: 6, points: 10, prompt: '21 × 6 = ?' },
  { id: 'est-7', lessonId: 'bai-23', kind: KIND.MUL_2DIGIT, a: 29, b: 7, points: 10, prompt: '29 × 7 = ?' },
  { id: 'est-8', lessonId: 'bai-23', kind: KIND.MUL_2DIGIT, a: 31, b: 8, points: 10, prompt: '31 × 8 = ?' },
  { id: 'est-9', lessonId: 'bai-26', kind: KIND.DIV, a: 78, b: 6, points: 10, prompt: '78 : 6 = ?' },
  { id: 'est-10', lessonId: 'bai-26', kind: KIND.DIV, a: 98, b: 7, points: 10, prompt: '98 : 7 = ?' },
  {
    id: 'est-11', lessonId: 'bai-13', kind: KIND.MUL_2DIGIT, a: 18, b: 8, points: 10,
    prompt: '18 × 8 = ?',
  },
  {
    id: 'est-12', lessonId: 'bai-26', kind: KIND.DIV, a: 99, b: 9, points: 10,
    prompt: '99 : 9 = ?',
  },
];

/** Dòng sẵn sàng INSERT vào bảng questions. */
function buildQuestionRows() {
  return SPECS.map((s, i) => ({
    id: s.id,
    setId: SET_ID,
    lessonId: s.lessonId,
    type: 'estimate',
    prompt: s.prompt,
    optionsJson: null,
    correctAnswer: encodeAnswer(computeParams(s.kind, s.a, s.b)),
    points: s.points,
    category: CATEGORY,
    sortOrder: i + 1,
  }));
}

module.exports = { SET_ID, SET_TITLE, SET_LESSON_ID, CATEGORY, SPECS, buildQuestionRows };
