/* Khu quản lý Estimate dành riêng cho tài khoản giáo viên. */
(function teacherEstimatePage() {
  const $ = id => document.getElementById(id);
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  let overview = null;
  let estimateSets = [];
  let activeQuestions = [];
  let editingQuestionId = null;

  function message(id, text, error = false) {
    const node = $(id);
    if (!node) return;
    node.textContent = text || '';
    node.classList.toggle('text-error', !!error);
    node.classList.toggle('text-primary', !error);
  }

  function renderSetSelects() {
    const questionOptions = estimateSets.map(set => `<option value="${esc(set.id)}">${esc(set.title)} (${set.question_count} câu)</option>`).join('');
    const assignableSets = estimateSets.filter(set => !set.other_count && set.question_count > 0);
    const assignmentOptions = assignableSets.map(set => `<option value="${esc(set.id)}">${esc(set.title)} (${set.question_count} câu)</option>`).join('');
    const questionSelect = $('te-question-set');
    const previousQuestionSet = questionSelect.value;
    questionSelect.innerHTML = `<option value="">${estimateSets.length ? 'Chọn phiếu ước lượng' : 'Chưa có phiếu estimate'}</option>${questionOptions}`;
    if (estimateSets.some(set => set.id === previousQuestionSet)) questionSelect.value = previousQuestionSet;
    const assignmentSelect = $('te-assignment-set');
    const previousAssignmentSet = assignmentSelect.value;
    assignmentSelect.innerHTML = `<option value="">${assignableSets.length ? 'Chọn phiếu ước lượng' : 'Chưa có phiếu chỉ gồm câu Estimate'}</option>${assignmentOptions}`;
    if (assignableSets.some(set => set.id === previousAssignmentSet)) assignmentSelect.value = previousAssignmentSet;
    renderSetList();
  }

  function renderSetList() {
    $('te-set-list').innerHTML = estimateSets.length ? estimateSets.map(set => `
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-container-low px-4 py-3">
        <div><strong class="text-primary">${esc(set.title)}</strong><span class="ml-2 text-sm text-on-surface-variant">${set.question_count} câu ước lượng${set.other_count ? ` • ${set.other_count} câu loại khác` : ''}</span><p class="text-xs text-on-surface-variant">Mã: ${esc(set.id)}${set.lesson_number ? ` • Bài ${set.lesson_number}` : ''}</p></div>
        <button type="button" class="rounded-lg bg-surface-container-high px-3 py-2 text-sm font-bold" data-open-set="${esc(set.id)}">Quản lý câu</button>
      </div>`).join('') : '<p class="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Chưa có bộ đề Estimate. Tạo phiếu ở trên rồi thêm câu hỏi.</p>';
  }

  async function loadQuestions(setId) {
    activeQuestions = [];
    $('te-question-list').innerHTML = setId ? '<p class="text-sm text-on-surface-variant">Đang tải câu hỏi…</p>' : '<p class="text-sm text-on-surface-variant">Chọn một phiếu để xem và quản lý câu hỏi.</p>';
    if (!setId) return;
    try {
      const data = await window.MathAPI.get(`/api/teacher/question-sets/${encodeURIComponent(setId)}/questions`);
      activeQuestions = data.questions.filter(question => question.type === 'estimate');
      const otherCount = data.questions.length - activeQuestions.length;
      $('te-question-list').innerHTML = activeQuestions.length ? activeQuestions.map((question, index) => {
        let answer = {};
        try { answer = JSON.parse(question.correct_answer); } catch { /* báo lỗi dữ liệu ở nội dung hiển thị */ }
        return `<article class="rounded-2xl bg-surface-container-low p-4">
          <div class="flex flex-wrap items-start justify-between gap-2"><div><p class="text-xs font-bold uppercase tracking-wide text-tertiary">Câu ${index + 1} • ${question.points} điểm</p><h3 class="mt-1 font-headline-sm text-primary">${esc(question.prompt)}</h3></div><div class="flex gap-2"><button type="button" class="rounded-lg bg-surface-container-high px-3 py-2 text-sm font-bold" data-edit-question="${esc(question.id)}">Sửa</button><button type="button" class="rounded-lg bg-error-container px-3 py-2 text-sm font-bold text-on-error-container" data-delete-question="${esc(question.id)}">Xóa</button></div></div>
          <p class="mt-2 text-sm text-on-surface-variant">Khoảng hợp lý: ${answer.min == null ? '—' : `${answer.min}–${answer.max}`} • Ước lượng chuẩn: ${answer.canonical == null ? '—' : answer.canonical} • Đáp án chính xác: ${answer.exact == null ? '—' : answer.exact}</p>
          <p class="text-xs text-on-surface-variant">Chủ đề: ${esc(question.category || 'Chưa đặt chủ đề')}</p>
        </article>`;
      }).join('') : '<p class="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Phiếu này chưa có câu Estimate.</p>';
      if (otherCount) message('te-question-message', `Lưu ý: phiếu hiện có ${otherCount} câu thuộc type khác. Khu Estimate chỉ hiển thị/sửa câu Estimate.`);
    } catch (error) {
      $('te-question-list').innerHTML = `<p class="text-error">Không tải được câu hỏi: ${esc(error.message)}</p>`;
    }
  }

  async function loadAll() {
    try {
      const [data, lessonsData, setData] = await Promise.all([
        window.MathAPI.get('/api/teacher/estimate/overview'),
        window.MathAPI.get('/api/teacher/lessons'),
        window.MathAPI.get('/api/teacher/question-sets'),
      ]);
      overview = data;
      const questionSetList = await Promise.all(setData.questionSets.map(async set => {
        const result = await window.MathAPI.get(`/api/teacher/question-sets/${encodeURIComponent(set.id)}/questions`);
        const estimateCount = result.questions.filter(question => question.type === 'estimate').length;
        // Phiếu vừa tạo chưa có câu vẫn phải xuất hiện để giáo viên chọn và thêm câu đầu tiên.
        return estimateCount || result.questions.length === 0
          ? { ...set, question_count: estimateCount, other_count: result.questions.length - estimateCount }
          : null;
      }));
      estimateSets = questionSetList.filter(Boolean);
      const lessonSelect = $('te-lesson-select');
      lessonSelect.innerHTML = '<option value="">Chọn bài học</option>' + lessonsData.lessons.map(lesson => `<option value="${esc(lesson.id)}">Bài ${lesson.number}: ${esc(lesson.title)}</option>`).join('');
      $('te-students').textContent = overview.studentCount;
      $('te-sets').textContent = overview.setCount;
      $('te-completion').textContent = `${overview.completedCount}/${overview.assignedCount}`;
      $('te-best').textContent = overview.bestScore == null ? '—' : `${overview.bestScore}%`;
      $('te-class-name').value = overview.className || 'Chưa gắn lớp';
      const assignments = overview.assignments || [];
      $('te-assignment-list').innerHTML = assignments.length ? assignments.map(assignment => `
        <article class="rounded-2xl bg-surface-container-low p-4">
          <div class="flex flex-wrap items-start justify-between gap-2"><div><strong class="text-primary">${esc(assignment.set_title)}</strong><p class="mt-1 text-sm text-on-surface-variant">${assignment.due_date ? `Hạn nộp: ${esc(assignment.due_date)}` : 'Chưa đặt hạn nộp'}${assignment.note ? ` • ${esc(assignment.note)}` : ''}</p></div><button type="button" class="rounded-lg bg-error-container px-3 py-2 text-sm font-bold text-on-error-container" data-unassign="${assignment.id}">Hủy giao</button></div>
          <p class="mt-2 text-sm">Đã làm <strong>${assignment.done_students}/${assignment.total_students}</strong> • Điểm cao nhất ${assignment.best_score == null ? '—' : `${assignment.best_score}%`} • Ước lượng sai ${assignment.estimate_wrong_rate}% • Tính chính xác sai ${assignment.exact_wrong_rate}%</p>
        </article>`).join('') : '<p class="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Chưa giao phiếu ước lượng nào cho lớp.</p>';
      $('te-student-list').innerHTML = overview.students.length ? `
        <table class="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead><tr class="bg-surface-container-low text-primary"><th class="p-3">Học sinh</th><th class="p-3">Tài khoản</th><th class="p-3">Đã hoàn thành</th><th class="p-3">Điểm cao nhất</th><th class="p-3">Tổng sao</th><th class="p-3">Bài đã làm</th></tr></thead>
          <tbody>${overview.students.map(student => `<tr class="border-b border-outline-variant/40"><td class="p-3 font-bold">${esc(student.full_name)}</td><td class="p-3">${esc(student.username)}</td><td class="p-3">${student.completed}/${student.assigned.length}</td><td class="p-3">${student.best_score == null ? '—' : `${student.best_score}%`}</td><td class="p-3">⭐ ${student.total_stars}</td><td class="p-3"><button type="button" data-history-student="${student.id}" class="rounded-lg bg-secondary-container px-3 py-2 font-bold text-primary">Xem các lần làm</button></td></tr>`).join('')}</tbody>
        </table>` : '<p class="rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant">Chưa có danh sách học sinh thuộc lớp của tài khoản giáo viên.</p>';
      renderSetSelects();
      await loadQuestions($('te-question-set').value);
    } catch (error) {
      message('teacher-estimate-message', `Không tải được dữ liệu giáo viên: ${error.message}`, true);
      $('teacher-estimate-message').classList.remove('hidden');
    }
  }

  $('te-set-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      const created = await window.MathAPI.post('/api/teacher/question-sets', { ...body, kind: 'exercise', starReward: 40, durationMinutes: 0 });
      const createdSetId = created.questionSet.id;
      message('te-set-message', 'Đã tạo phiếu và chuyển sang phần Quản lý câu hỏi.');
      form.reset();
      await loadAll();
      $('te-question-set').value = createdSetId;
      await loadQuestions(createdSetId);
      $('te-question-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) { message('te-set-message', error.message, true); }
  });

  $('te-question-set').addEventListener('change', event => loadQuestions(event.target.value));
  $('te-question-form').addEventListener('submit', async event => {
    event.preventDefault();
    const setId = $('te-question-set').value;
    if (!setId) return message('te-question-message', 'Hãy chọn hoặc tạo phiếu trước.', true);
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      if (editingQuestionId) {
        await window.MathAPI.put(`/api/teacher/estimate/questions/${encodeURIComponent(editingQuestionId)}`, body);
        message('te-question-message', 'Đã cập nhật câu hỏi và hệ thống đã tính lại khoảng/đáp án.');
      } else {
        await window.MathAPI.post(`/api/teacher/estimate/sets/${encodeURIComponent(setId)}/questions`, body);
        message('te-question-message', 'Đã thêm câu hỏi Estimate.');
      }
      resetQuestionForm();
      await loadAll();
      $('te-question-set').value = setId;
      await loadQuestions(setId);
    } catch (error) { message('te-question-message', error.message, true); }
  });

  function resetQuestionForm() {
    editingQuestionId = null;
    $('te-question-form').reset();
    $('te-question-form').elements.points.value = '10';
    $('te-question-form').elements.category.value = 'Ước lượng trước khi tính';
    $('te-question-save').textContent = 'Thêm câu hỏi';
    $('te-question-cancel').classList.add('hidden');
  }
  $('te-question-cancel').addEventListener('click', resetQuestionForm);

  $('te-question-list').addEventListener('click', async event => {
    const edit = event.target.closest('[data-edit-question]');
    const remove = event.target.closest('[data-delete-question]');
    if (edit) {
      const question = activeQuestions.find(item => item.id === edit.dataset.editQuestion);
      if (!question) return;
      editingQuestionId = question.id;
      $('te-question-form').elements.prompt.value = question.prompt;
      $('te-question-form').elements.points.value = question.points;
      $('te-question-form').elements.category.value = question.category || '';
      $('te-question-save').textContent = 'Lưu thay đổi';
      $('te-question-cancel').classList.remove('hidden');
      $('te-question-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (remove && confirm('Xóa câu hỏi ước lượng này?')) {
      try {
        await window.MathAPI.del(`/api/teacher/estimate/questions/${encodeURIComponent(remove.dataset.deleteQuestion)}`);
        message('te-question-message', 'Đã xóa câu hỏi.');
        await loadAll();
      } catch (error) { message('te-question-message', error.message, true); }
    }
  });

  $('te-set-list').addEventListener('click', event => {
    const button = event.target.closest('[data-open-set]');
    if (!button) return;
    $('te-question-set').value = button.dataset.openSet;
    loadQuestions(button.dataset.openSet);
    $('te-question-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  $('te-assignment-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      await window.MathAPI.post('/api/teacher/estimate/assignments', body);
      message('te-assignment-message', `Đã giao phiếu cho lớp ${overview.className}.`);
      form.reset();
      await loadAll();
    } catch (error) { message('te-assignment-message', error.message, true); }
  });

  $('te-assignment-list').addEventListener('click', async event => {
    const button = event.target.closest('[data-unassign]');
    if (!button || !confirm('Hủy giao phiếu này cho lớp?')) return;
    try {
      await window.MathAPI.del(`/api/teacher/estimate/assignments/${button.dataset.unassign}`);
      await loadAll();
    } catch (error) { message('teacher-estimate-message', error.message, true); }
  });

  $('te-student-list').addEventListener('click', async event => {
    const button = event.target.closest('[data-history-student]');
    if (!button) return;
    const panel = $('te-attempt-history');
    panel.innerHTML = '<p class="text-sm text-on-surface-variant">Đang tải lịch sử bài làm…</p>';
    try {
      const data = await window.MathAPI.get(`/api/teacher/estimate/students/${encodeURIComponent(button.dataset.historyStudent)}/attempts`);
      panel.innerHTML = `<h3 class="font-headline-sm text-primary">Các lần làm của ${esc(data.student.full_name)} • Điểm cao nhất: ${data.bestScore == null ? '—' : `${data.bestScore}%`}</h3>` +
        (data.attempts.length ? data.attempts.map((attempt, index) => `
          <details class="mt-3 rounded-2xl border border-outline-variant/50 bg-surface-container-low p-4" ${index === 0 ? 'open' : ''}>
            <summary class="cursor-pointer font-bold">${esc(attempt.setTitle)} • ${esc(attempt.createdAt)} • ${attempt.score}%</summary>
            ${attempt.gradingBasis === 'current' ? '<p class="mt-2 text-xs text-on-surface-variant">Lượt cũ: chi tiết câu được đối chiếu theo quy tắc hiện tại; điểm hiển thị là điểm đã lưu khi nộp.</p>' : ''}
            <div class="mt-3 space-y-2">${attempt.questions.map((question, number) => `
              <div class="rounded-xl bg-surface-container-lowest p-3 text-sm">
                <p class="font-bold">Câu ${number + 1}: ${esc(question.prompt)}</p>
                <p>Ước lượng: ${question.estimateOk ? 'Đúng ✅' : 'Sai ❌'} • Em chọn ${question.estimateMin == null ? '—' : `${esc(question.estimateMin)}–${esc(question.estimateMax)}`} • Khoảng hợp lý ${question.correctRange.min}–${question.correctRange.max}</p>
                <p>Tính chính xác: ${question.exactOk ? 'Đúng ✅' : 'Sai ❌'} • Em nhập ${question.exactGiven == null ? '—' : esc(question.exactGiven)} • Đáp án ${question.exactAnswer}</p>
              </div>`).join('')}</div>
          </details>`).join('') : '<p class="mt-3 rounded-xl bg-surface-container-low p-4 text-sm">Học sinh chưa nộp phiếu Ước lượng.</p>');
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      panel.innerHTML = `<p class="text-error">Không tải được lịch sử: ${esc(error.message)}</p>`;
    }
  });

  $('te-export').addEventListener('click', async () => {
    try {
      const token = localStorage.getItem('vuon_toan_token_client');
      const response = await fetch('/api/teacher/estimate/report.csv', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error('Không tải được báo cáo. Hãy kiểm tra tài khoản giáo viên.');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url; link.download = 'bao-cao-uoc-luong-lop.csv'; link.click();
      URL.revokeObjectURL(url);
    } catch (error) { message('teacher-estimate-message', error.message, true); }
  });

  document.addEventListener('mathapp:user-ready', event => {
    if (event.detail && event.detail.role === 'teacher') loadAll();
  });
})();
