/* Track B — Lối vào nổi bật cho dạng "Ước lượng trước khi tính đúng".
 * Chèn một thẻ lớn vào đầu nội dung các trang quen thuộc (Trang chủ, Mục lục, Luyện tập, Góc Thầy Cô).
 * Không sửa logic trang cũ: chỉ thêm 1 phần tử DOM. Nội dung đổi theo vai trò người dùng. */
(function estimateEntry() {
  const COPY = {
    student: {
      title: 'MỚI: Ước lượng kết quả trước khi tính đúng',
      desc: 'Vào khu luyện tập riêng, chọn phiếu nhân/chia và xem điểm cùng nhận xét sau khi nộp bài.',
      cta: 'Vào khu luyện tập →',
      guide: '📖 Xem cách làm trước khi học',
      aria: 'Luyện tập mới: Ước lượng kết quả trước khi tính đúng',
    },
    teacher: {
      title: 'MỚI: Phiếu “Ước lượng kết quả trước khi tính đúng”',
      desc: 'Khu riêng cho phiếu ước lượng nhân/chia, hướng dẫn làm bài và kết quả chi tiết sau khi học sinh nộp.',
      cta: 'Mở khu bài tập →',
      guide: '📖 Hướng dẫn cho giáo viên',
      aria: 'Mở phiếu luyện tập Ước lượng kết quả trước khi tính đúng',
    },
  };

  let isTeacher = document.body.dataset.requireRole === 'teacher'
    || document.body.dataset.page === 'schedule';
  let card, guide;

  function focusRing(el, on) {
    el.style.outline = on ? '4px solid #16a34a' : '';
    el.style.outlineOffset = on ? '2px' : '';
  }

  function applyCopy() {
    if (!card || !guide) return;
    const c = isTeacher ? COPY.teacher : COPY.student;
    card.href = isTeacher ? 'estimate-teacher.html' : 'estimate-center.html';
    guide.href = isTeacher ? 'estimate-teacher.html#teacher-guide' : 'estimate-guide.html';
    card.setAttribute('aria-label', c.aria);
    card.innerHTML =
      '<span style="font-size:36px" aria-hidden="true">🎯</span>' +
      `<span style="flex:1"><strong style="display:block;font-size:18px">${c.title}</strong>` +
      `<span style="font-size:14px;display:block;margin-top:2px">${c.desc}</span></span>` +
      `<span style="background:#16a34a;color:#fff;font-weight:800;padding:10px 18px;border-radius:14px;white-space:nowrap">${c.cta}</span>`;
    guide.textContent = c.guide;
  }

  function addStandaloneLink() {
    const desktop = document.querySelector('#app-sidebar nav');
    const mobile = document.getElementById('app-mobile-nav');
    [desktop, mobile].forEach(nav => {
      if (!nav) return;
      const existing = nav.querySelector('[data-estimate-sidebar-entry]');
      if (existing) {
        existing.href = isTeacher ? 'estimate-teacher.html' : 'estimate-center.html';
        return;
      }
      const link = document.createElement('a');
      link.id = nav.id === 'app-mobile-nav' ? 'estimate-mobile-entry' : 'estimate-sidebar-entry';
      link.dataset.estimateSidebarEntry = 'true';
      link.href = isTeacher ? 'estimate-teacher.html' : 'estimate-center.html';
      link.title = 'Khu luyện tập Ước lượng';
      link.setAttribute('aria-label', 'Khu luyện tập Ước lượng');
      link.className = nav.id === 'app-mobile-nav'
        ? 'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-on-surface-variant'
        : 'sidebar-nav-item w-11 h-11 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center relative group transition-all duration-200 text-on-surface-variant hover:text-primary hover:bg-surface-container-high/60';
      link.innerHTML = '<span class="material-symbols-outlined text-[24px]">calculate</span>' +
        (nav.id === 'app-mobile-nav' ? '<span class="text-[10px] leading-tight font-headline-sm mt-0.5">Ước lượng</span>' : '<span class="hidden md:block absolute left-full ml-3 px-3 py-1.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-headline-sm text-[12px] shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 z-50">Khu luyện tập Ước lượng</span>');
      nav.appendChild(link);
    });
  }

  function mount() {
    if (document.body.dataset.page === 'estimate-center') { addStandaloneLink(); return; }
    const main = document.querySelector('main');
    if (!main || document.getElementById('estimate-entry')) return;
    const host = main.firstElementChild || main;

    const wrap = document.createElement('div');
    wrap.id = 'estimate-entry';
    wrap.style.cssText = 'margin:0 0 20px;display:flex;flex-direction:column;gap:8px;';

    card = document.createElement('a');
    card.id = 'estimate-entry-card';
    card.href = 'estimate-center.html';
    card.style.cssText = 'display:flex;align-items:center;gap:16px;padding:16px 20px;border-radius:20px;' +
      'background:linear-gradient(90deg,#fef3c7,#d1fae5);border:2px solid #f59e0b;text-decoration:none;color:#14532d;' +
      'box-shadow:0 4px 0 0 #e6a400;';
    card.addEventListener('focus', () => focusRing(card, true));
    card.addEventListener('blur', () => focusRing(card, false));

    guide = document.createElement('a');
    guide.id = 'estimate-guide-link';
    guide.href = 'estimate-guide.html';
    guide.style.cssText = 'align-self:flex-start;font-size:14px;font-weight:700;color:#006127;' +
      'background:#ecfdf5;border:1px solid #86efac;border-radius:999px;padding:6px 14px;text-decoration:none;';
    guide.addEventListener('focus', () => focusRing(guide, true));
    guide.addEventListener('blur', () => focusRing(guide, false));

    applyCopy();
    addStandaloneLink();
    wrap.append(card, guide);
    host.insertBefore(wrap, host.firstChild);
  }

  // Trang chủ/Mục lục dùng chung cho cả 2 vai trò: khi biết người dùng là giáo viên thì đổi lời mời.
  document.addEventListener('mathapp:user-ready', e => {
    const role = e.detail && e.detail.role;
    if (role === 'teacher' && !isTeacher) { isTeacher = true; applyCopy(); }
    addStandaloneLink();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
