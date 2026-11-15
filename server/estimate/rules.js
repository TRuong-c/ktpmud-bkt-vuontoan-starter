'use strict';
/**
 * Track B — Ước lượng trước khi tính đúng.
 * Module THUẦN (không đụng DB/HTTP): quy tắc toán + chấm điểm tất định (B-03, B-06).
 * Không dùng Math.random, không gọi LLM. Cùng đầu vào => luôn cùng đầu ra.
 *
 * Định dạng đáp án duy nhất (ADR-001), lưu trong cột questions.correct_answer:
 *   {"min":110,"max":120,"canonical":120,"exact":114}
 */

/** Ba loại câu (ADR-002) — mỗi loại đúng MỘT công thức. */
const KIND = Object.freeze({
  MUL_TABLE: 'mul-table', // Loại 1: a × b trong bảng nhân 6,7,8,9
  MUL_2DIGIT: 'mul-2digit', // Loại 2: A × b, làm tròn thừa số A đến hàng chục
  DIV: 'div', // Loại 3: A : b, chia cho 6,7,8,9
});

/** Làm tròn đến hàng chục: chữ số đơn vị 0..4 xuống, 5..9 lên. */
const round10 = n => Math.floor((n + 5) / 10) * 10;
const floor10 = n => Math.floor(n / 10) * 10;
const ceil10 = n => Math.ceil(n / 10) * 10;
/** Làm tròn nửa lên cho số không âm (0.5 -> 1). */
const roundHalfUp = x => Math.floor(x + 0.5);

function assertPosInt(name, v) {
  if (!Number.isSafeInteger(v) || v <= 0) throw new RangeError(`${name} phải là số nguyên dương, nhận được: ${v}`);
}

/**
 * Tính bộ tham số {min,max,canonical,exact} cho một phép tính.
 * @param {string} kind  một trong KIND
 * @param {number} a     thừa số/số bị chia thứ nhất
 * @param {number} b     thừa số/số chia thứ hai
 */
function computeParams(kind, a, b) {
  assertPosInt('a', a);
  assertPosInt('b', b);
  switch (kind) {
    case KIND.MUL_TABLE: {
      const p = a * b;
      return { min: floor10(p), max: ceil10(p), canonical: round10(p), exact: p };
    }
    case KIND.MUL_2DIGIT: {
      const p = a * b;
      const e = round10(a) * b;
      return { min: Math.min(floor10(p), e), max: Math.max(ceil10(p), e), canonical: e, exact: p };
    }
    case KIND.DIV: {
      if (a % b !== 0) throw new RangeError(`Phép chia ${a} : ${b} phải chia hết (lớp 3).`);
      const q = a / b;
      return { min: Math.max(1, q - 1), max: q + 1, canonical: roundHalfUp(round10(a) / b), exact: q };
    }
    default:
      throw new RangeError(`Loại câu ước lượng không hợp lệ: ${kind}`);
  }
}

/** Chuỗi JSON chuẩn lưu vào DB (thứ tự khoá cố định). */
function encodeAnswer(p) {
  return JSON.stringify({ min: p.min, max: p.max, canonical: p.canonical, exact: p.exact });
}

/** Đọc lại correct_answer; ném lỗi nếu sai định dạng/sai bất biến. */
function parseAnswer(raw) {
  let o;
  try { o = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { throw new Error('correct_answer không phải JSON hợp lệ.'); }
  if (!o || typeof o !== 'object') throw new Error('correct_answer phải là object JSON.');
  for (const k of ['min', 'max', 'canonical', 'exact']) {
    if (!Number.isInteger(o[k])) throw new Error(`correct_answer thiếu/sai trường "${k}".`);
  }
  if (!(o.min <= o.canonical && o.canonical <= o.max && o.min <= o.exact && o.exact <= o.max)) {
    throw new Error('correct_answer vi phạm min <= canonical,exact <= max.');
  }
  return { min: o.min, max: o.max, canonical: o.canonical, exact: o.exact };
}

/**
 * Chỉ nhận số nguyên không âm: chuỗi chữ số (cho phép khoảng trắng 2 đầu) hoặc Number nguyên.
 * Từ chối: rỗng, "115abc", "115.5", "-5", "20*6", "NaN", "Infinity", null, object...
 * @returns {number|null}
 */
function parseIntStrict(v) {
  if (typeof v === 'number') return Number.isSafeInteger(v) && v >= 0 ? v : null;
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!/^\d{1,9}$/.test(s)) return null;
  return Number(s);
}

/** Điểm theo ma trận 4 trạng thái (ADR-003). */
function earnedFor(points, estimateOk, exactOk) {
  if (estimateOk && exactOk) return points;
  if (estimateOk || exactOk) return roundHalfUp(points * 0.5);
  return 0;
}

function buildFeedback(p, u, estimateOk, exactOk) {
  if (estimateOk && exactOk) {
    return `Xuất sắc! Khoảng em chọn nằm trong khoảng hợp lý (${p.min}–${p.max}) và em tính đúng kết quả chính xác (${p.exact})!`;
  }
  if (estimateOk) return 'Em ước lượng khoảng rất tốt! Tuy nhiên kết quả tính chính xác còn nhầm, em kiểm tra lại bảng nhân/chia nhé.';
  if (exactOk) return 'Em tính ra kết quả chính xác đúng rồi! Nhưng bước ước lượng ban đầu chưa sát khoảng hợp lý, em nhớ làm tròn số nhé.';
  return 'Cả số ước lượng và kết quả tính đúng đều chưa chính xác. Em hãy làm tròn số để ước lượng khoảng trước rồi tính lại nhé!';
}

/**
 * Chấm một câu estimate.
 * @param {object} q       {id, points, correct_answer}
 * @param {*} given        {estimateMin, estimateMax, exact, roundBefore?, roundAfter?} hoặc dữ liệu lạ
 */
function gradeEstimate(q, given) {
  const p = parseAnswer(q.correct_answer);
  const g = given && typeof given === 'object' && !Array.isArray(given) ? given : {};
  const u = parseIntStrict(g.estimate);
  const estimateMin = parseIntStrict(g.estimateMin);
  const estimateMax = parseIntStrict(g.estimateMax);
  const v = parseIntStrict(g.exact);
  // Dải học sinh chọn phải nằm trọn trong khoảng hợp lý do công thức tính ra.
  const prompt = String(q.prompt || '');
  const expr = prompt.match(/(?:^|\s)(\d{2,})\s*[×x]\s*(\d+)\s*=\s*\?/i);
  const expectedWidth = /[×x]/.test(prompt) ? 10 : 2;
  const intervalOk = estimateMin !== null && estimateMax !== null
    && estimateMax - estimateMin === expectedWidth
    && p.min <= estimateMin && estimateMax <= p.max;
  let estimateOk;
  if (expr) {
    const before = parseIntStrict(g.roundBefore);
    const after = parseIntStrict(g.roundAfter);
    const original = Number(expr[1]);
    estimateOk = before === original && after === round10(before) && intervalOk;
  } else {
    estimateOk = intervalOk;
  }
  const exactOk = v !== null && v === p.exact;
  const points = q.points;
  return {
    questionId: q.id,
    type: 'estimate',
    correct: estimateOk && exactOk,
    estimateOk,
    exactOk,
    earnedPoints: earnedFor(points, estimateOk, exactOk),
    maxPoints: points,
    acceptableRange: { min: p.min, max: p.max, canonical: p.canonical },
    exactAnswer: p.exact,
    feedback: buildFeedback(p, u, estimateOk, exactOk),
  };
}

module.exports = {
  KIND, round10, floor10, ceil10, roundHalfUp,
  computeParams, encodeAnswer, parseAnswer, parseIntStrict, earnedFor, gradeEstimate,
};
