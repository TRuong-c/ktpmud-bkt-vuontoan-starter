/* Trang "Ước lượng kết quả trước khi tính đúng" (Track B).
 * Bước 1: nhập cặp làm tròn khi cần, rồi kéo để chọn một khoảng cố định trên tia số.
 * Bước 2: chỉ mở sau khi đã chọn khoảng; đáp án chính xác không gửi xuống trình duyệt.
 * Khi nộp, gửi lựa chọn ước lượng và kết quả chính xác để server chấm.
 */
(function estimatePage() {
  const DEFAULT_SET = 'phieu-uoc-luong-nhan-chia';
  const params = new URLSearchParams(location.search);
  const setId = params.get('set') || DEFAULT_SET;
  const startedAt = Date.now();
  let questions = [];
  let submitted = false;

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isInt = v => /^\d{1,9}$/.test(String(v).trim());

  const MSG = {
    emptyEstimate: 'Em hãy kéo núm tròn để chọn một khoảng ước lượng nhé!',
    badEstimate: 'Em hãy chọn một khoảng ước lượng hợp lệ nhé!',
    emptyExact: 'Em hãy nhập kết quả tính đúng vào Bước 2 nhé!',
    badExact: 'Ô Tính đúng chỉ nhận chữ số 0–9 thôi nhé (không dùng chữ, dấu chấm, dấu phẩy hay dấu trừ).',
    lockedExact: 'Em hãy nhập ước lượng hợp lệ ở Bước 1 trước, rồi mới tính Bước 2 nhé!',
  };

  const inputCls = 'w-full sm:w-40 h-14 text-center rounded-2xl bg-surface-container-low text-primary font-headline-lg focus:outline-none focus:ring-4 focus:ring-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed';

  const inp = (q, step) => document.querySelector(`input[data-q="${q.id}"][data-step="${step}"]`);
  const operation = q => String(q.prompt).match(/(?:^|\s)(\d+)\s*([×x:]|÷)\s*(\d+)\s*=\s*\?/i);
  const roundingTask = q => {
    const match = operation(q);
    return match && Number(match[1]) >= 10 && /[×x]/.test(match[2]) ? match : null;
  };
  const intervalWidth = q => /[×x]/.test((operation(q) || [])[2] || '') ? 10 : 2;
  function axisFor(q) {
    const match = operation(q);
    if (!match) return null;
    const a = Number(match[1]), b = Number(match[3]);
    let center, rangeMin, rangeMax, span, tickStep;
    if (/[×x]/.test(match[2])) {
      const exact = a * b;
      const lowerTens = Math.floor(exact / 10) * 10;
      const upperTens = Math.ceil(exact / 10) * 10;
      rangeMin = lowerTens;
      rangeMax = upperTens;
      if (roundingTask(q)) {
        if (!roundingReady(q)) return null;
        const roundedProduct = Number(inp(q, 'roundAfter').value) * b;
        rangeMin = Math.min(rangeMin, roundedProduct);
        rangeMax = Math.max(rangeMax, roundedProduct);
        center = roundedProduct;
      } else {
        center = Math.floor((exact + 5) / 10) * 10;
      }
      span = Math.max(40, center - rangeMin, rangeMax - center);
      tickStep = 10;
    } else {
      if (a % b !== 0) return null;
      const exact = a / b;
      rangeMin = Math.max(1, exact - 1);
      rangeMax = exact + 1;
      center = Math.floor(Math.floor((a + 5) / 10) * 10 / b + 0.5);
      span = Math.max(4, center - rangeMin, rangeMax - center);
      tickStep = 1;
    }
    return {
      min: Math.max(0, center - span),
      max: center + span,
      rangeMin,
      rangeMax,
      step: 1,
      tickStep,
    };
  }
  const roundingReady = q => {
    const expr = roundingTask(q);
    if (!expr) return true;
    const before = inp(q, 'roundBefore'), after = inp(q, 'roundAfter');
    return isInt(before.value) && isInt(after.value)
      && Number(before.value) === Number(expr[1])
      && Number(after.value) === Math.floor((Number(before.value) + 5) / 10) * 10;
  };
  const errEl = q => document.querySelector(`[data-err="${q.id}"]`);

  function showErr(q, text, field) {
    const e = errEl(q);
    if (!e) return;
    e.textContent = text || '';
    e.classList.toggle('hidden', !text);
    const u = inp(q, 'estimate'), v = inp(q, 'exact');
    const bad = ['roundBefore', 'roundAfter'].includes(field) ? inp(q, field)
      : field === 'estimate' ? u : field === 'exact' ? v : null;
    [u, v, inp(q, 'roundBefore'), inp(q, 'roundAfter')].filter(Boolean)
      .forEach(i => i.setAttribute('aria-invalid', i === bad && text ? 'true' : 'false'));
  }
  function globalError(text) { const e = $('est-global-error'); if (!e) return; e.textContent = text || ''; e.classList.toggle('hidden', !text); }

  /** Bước 2 chỉ mở khi Bước 1 là số hợp lệ. */
  function syncStep(q) {
    if (submitted) return;
    const u = inp(q, 'estimate'), v = inp(q, 'exact');
    if (!u || !v) return;
    const roundOk = roundingReady(q);
    const ok = u.dataset.touched === 'true' && isInt(u.value) && roundOk;
    v.disabled = !ok;
    v.setAttribute('aria-disabled', ok ? 'false' : 'true');
    const badge = document.querySelector(`[data-step-badge="${q.id}"]`);
    if (badge) badge.classList.toggle('hidden', !ok);
  }

  function updateProgress() {
    if (!questions.length) { $('est-progress-text').textContent = 'Chưa có câu hỏi.'; return; }
    const done = questions.filter(q => inp(q, 'estimate').dataset.touched === 'true' && isInt(inp(q, 'exact').value)).length;
    const pct = Math.round(done / questions.length * 100);
    $('est-progress').style.width = `${pct}%`;
    $('est-progress-text').textContent = `Đã chọn khoảng và tính chính xác: ${done}/${questions.length} câu`;
    const bar = $('est-progressbar');
    if (bar) bar.setAttribute('aria-valuenow', String(pct));
  }

  function selectEstimate(q, value) {
    const slider = inp(q, 'estimate');
    if (!slider || slider.disabled) return;
    slider.value = String(value);
    slider.dataset.touched = 'true';
    slider.classList.remove('opacity-60');
    updateSelectedInterval(q);
    syncStep(q);
    updateProgress();
    showErr(q, '');
    if (document.activeElement !== slider) slider.focus({ preventScroll: true });
  }

  function updateSelectedInterval(q) {
    const slider = inp(q, 'estimate');
    const readout = document.querySelector(`[data-estimate-readout="${q.id}"]`);
    if (!slider || !readout || slider.disabled) return;
    const model = axisFor(q);
    if (!model) return;
    const width = intervalWidth(q);
    const center = Number(slider.value);
    const lower = center - width / 2;
    const upper = lower + width;
    const domainWidth = Math.max(1, model.max - model.min);
    slider.style.setProperty('--selection-start', `${Math.max(0, Math.min(100, (lower - model.min) / domainWidth * 100))}%`);
    slider.style.setProperty('--selection-end', `${Math.max(0, Math.min(100, (upper - model.min) / domainWidth * 100))}%`);
    slider.classList.toggle('has-selection', slider.dataset.touched === 'true');
    if (slider.dataset.touched === 'true') {
      readout.textContent = `Khoảng em chọn: ${lower}–${upper}`;
      slider.setAttribute('aria-valuetext', `Khoảng em chọn từ ${lower} đến ${upper}`);
    } else {
      readout.textContent = `Kéo núm tròn để chọn khoảng rộng ${width} đơn vị`;
      slider.setAttribute('aria-valuetext', `Chưa chọn khoảng rộng ${width} đơn vị`);
    }
  }

  function renderAxis(q, reset = true) {
    const slider = inp(q, 'estimate');
    const ticks = document.querySelector(`[data-estimate-ticks="${q.id}"]`);
    const readout = document.querySelector(`[data-estimate-readout="${q.id}"]`);
    if (!slider || !ticks || !readout) return;
    const model = axisFor(q);
    slider.dataset.touched = reset ? 'false' : slider.dataset.touched || 'false';
    if (!model) {
      slider.min = '0'; slider.max = '0'; slider.step = '1'; slider.value = '0';
      slider.disabled = true;
      ticks.innerHTML = '';
      slider.classList.remove('has-selection');
      readout.textContent = roundingTask(q) ? 'Nhập giá trị làm tròn để mở tia số' : 'Chưa có khoảng để chọn';
    slider.setAttribute('aria-valuetext', 'Chưa chọn khoảng');
      return;
    }
    const width = intervalWidth(q);
    const centerMin = model.min + width / 2;
    const centerMax = model.max - width / 2;
    slider.min = String(centerMin);
    slider.max = String(centerMax);
    slider.step = String(model.step);
    // Start at the far-left selectable position so the untouched thumb cannot hint at an estimate.
    slider.value = reset || !slider.value ? String(centerMin) : String(Math.max(centerMin, Math.min(centerMax, Number(slider.value))));
    slider.disabled = !!roundingTask(q) && !roundingReady(q);
    slider.setAttribute('aria-valuemin', String(model.min));
    slider.setAttribute('aria-valuemax', String(model.max));
    if (reset || slider.disabled) {
      slider.dataset.touched = 'false';
      readout.textContent = slider.disabled ? 'Kiểm tra hai giá trị làm tròn trước nhé' : `Kéo núm tròn để chọn khoảng rộng ${width} đơn vị`;
    }
    slider.setAttribute('aria-valuemin', String(centerMin));
    slider.setAttribute('aria-valuemax', String(centerMax));
    updateSelectedInterval(q);
    const values = [];
    const firstTick = Math.ceil(model.min / model.tickStep) * model.tickStep;
    for (let value = firstTick; value <= model.max; value += model.tickStep) values.push(value);
    ticks.style.gridTemplateColumns = `repeat(${values.length}, minmax(0, 1fr))`;
    ticks.innerHTML = values.map(value => {
      return `<button type="button" tabindex="-1" data-estimate-tick="${q.id}" data-value="${value}" class="min-w-0 rounded-lg px-0 py-1 text-xs font-bold text-on-surface-variant hover:bg-primary-fixed focus:outline-none" ${slider.disabled ? 'disabled' : ''}><span class="mx-auto block h-2 w-px bg-outline-variant"></span>${value}</button>`;
    }).join('');
    ticks.querySelectorAll('[data-estimate-tick]').forEach(button => {
      button.addEventListener('click', () => selectEstimate(q, button.dataset.value));
    });
  }

  /** Kiểm tra đã chọn khoảng trên tia số; đã chọn thì mở khóa ô tính chính xác. */
  function unlockIfEstimateValid(q, focusNext) {
    const u = inp(q, 'estimate');
    const v = u.value.trim();
    if (u.dataset.touched !== 'true') { showErr(q, 'Em hãy kéo núm tròn để chọn một khoảng ước lượng trước nhé!', 'estimate'); return false; }
    if (v === '') { showErr(q, MSG.emptyEstimate, 'estimate'); return false; }
    if (!isInt(v)) { showErr(q, MSG.badEstimate, 'estimate'); return false; }
    showErr(q, '');
    syncStep(q);
    if (focusNext) inp(q, 'exact').focus();
    return true;
  }

  function render() {
    $('est-questions').innerHTML = questions.map((q, i) => `
      <article data-qwrap="${esc(q.id)}" class="rounded-3xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(0,97,39,0.06)] p-6">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-label-sm text-label-sm text-tertiary font-bold">Câu ${i + 1} • ${q.points} điểm${q.category ? ' • ' + esc(q.category) : ''}</p>
          <span data-step-badge="${esc(q.id)}" class="hidden inline-flex items-center gap-1 rounded-full bg-secondary-container text-on-secondary-container px-3 py-1 font-label-sm text-label-sm font-bold"><span class="material-symbols-outlined text-[16px]" aria-hidden="true">check_circle</span> Đã chọn khoảng ước lượng</span>
        </div>
        <h3 class="font-headline-md text-headline-md mt-1">${esc(q.prompt)}</h3>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${roundingTask(q) ? `<div class="sm:col-span-2 rounded-2xl border-2 border-secondary/30 bg-secondary-container/30 p-4">
            <div class="flex flex-wrap items-end gap-4">
              <label class="font-label-md font-bold">Trước ước lượng<input data-q="${esc(q.id)}" data-step="roundBefore" type="text" inputmode="numeric" maxlength="9" autocomplete="off" class="mt-1 block ${inputCls}" aria-label="Giá trị trước ước lượng, câu ${i + 1}" /></label>
              <span class="pb-3 text-2xl" aria-hidden="true">→</span>
              <label class="font-label-md font-bold">Sau ước lượng<input data-q="${esc(q.id)}" data-step="roundAfter" type="text" inputmode="numeric" maxlength="9" autocomplete="off" class="mt-1 block ${inputCls}" aria-label="Giá trị sau ước lượng, câu ${i + 1}" /></label>
            </div>
          </div>
          ` : ''}
          <div class="sm:col-span-2 rounded-2xl border-2 border-primary/20 bg-surface-container-low p-4" data-estimate-axis="${esc(q.id)}">
            <label for="u-${esc(q.id)}" class="block font-label-md font-bold text-on-surface-variant">Kéo núm tròn để chọn khoảng ước lượng</label>
            <p data-estimate-readout="${esc(q.id)}" class="mt-1 font-headline-sm font-bold text-primary" aria-live="polite">Chưa chọn khoảng</p>
            <div data-estimate-ticks="${esc(q.id)}" class="mt-3 grid gap-0" aria-hidden="true"></div>
            <input id="u-${esc(q.id)}" data-q="${esc(q.id)}" data-step="estimate" type="range" class="estimate-range mt-2 h-8 w-full focus:outline-none disabled:cursor-not-allowed disabled:opacity-40" aria-label="Khoảng ước lượng, câu ${i + 1}" aria-describedby="err-${esc(q.id)}" aria-valuetext="Chưa chọn khoảng" />
          </div>
          <div class="sm:col-span-2">
            <label for="v-${esc(q.id)}" class="block font-label-md text-label-md font-bold text-on-surface-variant">Kết quả chính xác</label>
            <input id="v-${esc(q.id)}" data-q="${esc(q.id)}" data-step="exact" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="9" autocomplete="off" disabled
              placeholder="Chính xác..." aria-disabled="true" aria-describedby="err-${esc(q.id)}" aria-invalid="false" class="mt-1 ${inputCls}"/>
          </div>
        </div>
        <p id="err-${esc(q.id)}" data-err="${esc(q.id)}" role="alert" aria-live="polite" class="hidden mt-3 rounded-xl bg-error-container text-on-error-container px-3 py-2 font-body-sm"></p>
      </article>`).join('');

    questions.forEach((q, i) => {
      const u = inp(q, 'estimate'), v = inp(q, 'exact');
      renderAxis(q);
      u.addEventListener('input', () => selectEstimate(q, u.value));
      u.addEventListener('pointerdown', () => setTimeout(() => selectEstimate(q, u.value), 0));

      if (roundingTask(q)) {
        const before = inp(q, 'roundBefore'), after = inp(q, 'roundAfter');
        const updateEstimate = () => {
          u.value = '';
          renderAxis(q);
          syncStep(q); updateProgress(); showErr(q, '');
        };
        [before, after].forEach(field => field.addEventListener('input', updateEstimate));
        before.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); after.focus(); } });
        after.addEventListener('keydown', e => {
          if (e.key !== 'Enter' && !(e.key === 'Tab' && !e.shiftKey)) return;
          e.preventDefault();
          if (!roundingReady(q)) { showErr(q, 'Em kiểm tra lại số ban đầu và số tròn chục gần nhất nhé!', 'roundAfter'); return; }
          u.focus();
        });
      }

      u.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); unlockIfEstimateValid(q, true); return; }
        if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault();
        if (u.dataset.touched !== 'true') { showErr(q, 'Em hãy kéo núm tròn để chọn một khoảng trước nhé!', 'estimate'); return; }
          unlockIfEstimateValid(q, true);
        }
      });
      u.addEventListener('blur', () => { if (u.dataset.touched === 'true') unlockIfEstimateValid(q, false); });

      // Ô 2 đang khoá: bấm vào thì nhắc quay lại Bước 1.
      v.parentElement.addEventListener('click', () => { if (v.disabled) { showErr(q, MSG.lockedExact, 'estimate'); (roundingTask(q) && !roundingReady(q) ? inp(q, 'roundBefore') : u).focus(); } });
      v.addEventListener('input', () => { if (!submitted) { showErr(q, ''); updateProgress(); } });
      v.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (!isInt(v.value)) { showErr(q, v.value.trim() === '' ? MSG.emptyExact : MSG.badExact, 'exact'); return; }
        const next = questions[i + 1];
        if (next) (roundingTask(next) ? inp(next, 'roundBefore') : inp(next, 'estimate')).focus();
        else submit();
      });
    });
    updateProgress();
    if (questions[0]) (roundingTask(questions[0]) ? inp(questions[0], 'roundBefore') : inp(questions[0], 'estimate')).focus({ preventScroll: true });
  }

  /** Kiểm tra toàn bộ trước khi nộp; chặn + báo lỗi tiếng Việt, trả về answers hoặc null. */
  function collect() {
    const answers = {};
    for (const q of questions) {
      const u = inp(q, 'estimate'), v = inp(q, 'exact');
      let roundAnswer = null;
      if (roundingTask(q)) {
        const before = inp(q, 'roundBefore'), after = inp(q, 'roundAfter');
        if (!isInt(before.value)) { showErr(q, 'Em nhập số ban đầu trước khi làm tròn nhé!', 'roundBefore'); before.focus(); return null; }
        if (!isInt(after.value)) { showErr(q, 'Em nhập số sau khi làm tròn nhé!', 'roundAfter'); after.focus(); return null; }
        if (!roundingReady(q)) { showErr(q, 'Em kiểm tra lại số ban đầu và số tròn chục gần nhất nhé!', 'roundAfter'); after.focus(); return null; }
        roundAnswer = { roundBefore: before.value.trim(), roundAfter: after.value.trim() };
      }
      if (u.dataset.touched !== 'true') { showErr(q, MSG.emptyEstimate, 'estimate'); u.focus(); return null; }
      if (u.value.trim() === '' || !isInt(u.value)) { showErr(q, MSG.badEstimate, 'estimate'); u.focus(); return null; }
      syncStep(q);
      if (v.value.trim() === '') { showErr(q, MSG.emptyExact, 'exact'); v.focus(); return null; }
      if (!isInt(v.value)) { showErr(q, MSG.badExact, 'exact'); v.focus(); return null; }
      const width = intervalWidth(q);
      const intervalMin = Number(u.value) - width / 2;
      const intervalMax = intervalMin + width;
      answers[q.id] = {
        ...(roundAnswer || {}),
        estimate: u.value.trim(),
        estimateMin: String(intervalMin),
        estimateMax: String(intervalMax),
        exact: v.value.trim(),
      };
    }
    return answers;
  }

  async function submit() {
    if (submitted) return;
    globalError('');
    const answers = collect();
    if (!answers) return;
    const btn = $('est-submit');
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    try {
      const r = await window.MathAPI.post('/api/submissions', { setId, answers, durationSec: Math.round((Date.now() - startedAt) / 1000) });
      submitted = true;
      document.querySelectorAll('input[data-q]').forEach(i => { i.disabled = true; });
      document.querySelectorAll('[data-estimate-tick]').forEach(button => { button.disabled = true; });
      const earned = (r.detail || []).reduce((s, d) => s + (Number(d.earnedPoints) || 0), 0);
      const maxPoints = (r.detail || []).reduce((s, d) => s + (Number(d.maxPoints) || 0), 0);
      const resultRows = (r.detail || []).map((d, index) => {
        const q = questions.find(item => item.id === d.questionId);
        return `<li class="rounded-2xl bg-surface-container-low p-4 text-left">
          <div class="flex flex-wrap items-center justify-between gap-2"><strong>Câu ${index + 1}: ${esc(q ? q.prompt : d.questionId)}</strong><strong>${d.earnedPoints}/${d.maxPoints} điểm</strong></div>
          <p class="mt-2">Ước lượng: <strong>${d.estimateOk ? 'Hợp lý ✅' : 'Cần luyện thêm ❌'}</strong> · Tính chính xác: <strong>${d.exactOk ? 'Đúng ✅' : 'Chưa đúng ❌'}</strong></p>
          <p class="mt-1">Đáp án chính xác: <strong>${d.exactAnswer == null ? '—' : d.exactAnswer}</strong></p>
          <p class="mt-1 text-on-surface-variant">${esc(d.feedback || '')}</p>
        </li>`;
      }).join('');
      const box = $('est-result');
      box.classList.remove('hidden');
      const emoji = r.scorePercent >= 80 ? '🎉' : r.scorePercent >= 50 ? '💪' : '🌱';
      const stars = r.starsEarned
        ? `Nhận thêm ⭐ +${r.starsEarned} Sao vàng.`
        : 'Điểm chưa vượt lần tốt nhất nên chưa cộng thêm sao.';
      box.innerHTML = `<div class="text-4xl mb-1" aria-hidden="true">${emoji}</div>
        <h3 class="font-headline-md text-headline-md">Em đạt ${r.scorePercent}% — ${r.correctCount}/${r.totalCount} câu đúng cả 2 bước!</h3>
        <p class="font-body-md mt-2 font-bold">Tổng điểm: ${earned}/${maxPoints} điểm</p>
        <p class="font-body-md mt-1">${stars} Kết quả đã được lưu vào hồ sơ.</p>
        <p class="font-body-sm text-body-sm mt-2">Xem kết quả và lời nhận xét cho từng câu ở dưới đây.</p>
        <ol class="mt-4 space-y-3">${resultRows}</ol>
        <div class="mt-4 flex flex-wrap justify-center gap-2">
          <a href="estimate-guide.html" class="rounded-2xl bg-surface-container-lowest px-4 py-2 font-label-md text-label-md text-primary inline-flex items-center gap-1"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">menu_book</span> Xem lại cách làm</a>
          <button type="button" id="est-result-retry" class="rounded-2xl bg-primary px-4 py-2 font-label-md text-label-md text-on-primary inline-flex items-center gap-1"><span class="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span> Làm lại</button>
        </div>`;
      $('est-result-retry').addEventListener('click', () => location.reload());
      box.focus();
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      if (/401|đăng nhập/i.test(e.message)) { globalError('Phiên đăng nhập đã hết, em đăng nhập lại nhé!'); location.href = 'login.html'; return; }
      globalError(`Chưa nộp được bài: ${e.message}`);
    }
  }

  async function loadSetTitle() {
    try {
      const data = await window.MathAPI.get('/api/lessons');
      const lesson = (data.lessons || []).find(l => (l.questionSets || []).some(s => s.id === setId));
      const set = lesson && lesson.questionSets.find(s => s.id === setId);
      if (set) {
        $('set-kind').textContent = `Bài ${lesson.number}: ${lesson.title} • ${questions.length} câu`;
        $('set-title').textContent = set.title;
        document.title = `${set.title} — Vườn Toán Lớp 3`;
      }
    } catch (_) { /* không chặn bài luyện nếu chỉ thiếu tiêu đề */ }
  }

  async function init() {
    try {
      const data = await window.MathAPI.get(`/api/question-sets/${encodeURIComponent(setId)}/questions`);
      questions = data.questions.filter(q => q.type === 'estimate');
      if (!questions.length) {
        $('est-questions').innerHTML = '<p class="font-body-md">Bộ bài này không có câu ước lượng.</p>';
        $('est-progress-text').textContent = 'Không có câu hỏi ước lượng.';
        return;
      }
      $('set-kind').textContent = `Bộ bài: ${setId} • ${questions.length} câu`;
      render();
      loadSetTitle();
    } catch (e) {
      $('est-questions').innerHTML = `<p class="font-body-md">Chưa tải được bài: ${esc(e.message)}</p>`;
      $('est-progress-text').textContent = 'Chưa tải được câu hỏi.';
    }
  }

  $('est-submit').addEventListener('click', submit);
  $('est-reset').addEventListener('click', () => location.reload());
  document.addEventListener('mathapp:user-ready', init);
})();
