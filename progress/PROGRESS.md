# PROGRESS — Nhóm 29 — Track B

- Starter: `fossbk-spec/ktpmud-bkt-vuontoan-starter` · tag `bkt-2026-v1`
- Fork: https://github.com/TRuong-c/ktpmud-bkt-vuontoan-starter
- Nhánh làm việc: `track-b-main`
- Bằng chứng Checkpoint 1: https://github.com/fossbk-spec/ktpmud-bkt-vuontoan-starter/pull/1
- Ghi chú: Checkpoint 1 được chấp nhận về scope, phải sửa các mục bắt buộc trước 23:59 ngày 15/11/2026.

## PC-1 — 11/11/2026

**Tình trạng chung:** Scope Checkpoint 1 đã được GV chấp nhận có điều kiện; nhóm đang cập nhật tài liệu theo nhận xét, chưa xác nhận đã triển khai xong tính năng mới, test tự động hoặc CI.

**Tài liệu chỉnh sửa cho PC-1:** `REQUIREMENTS.md` (v2.1), `DECISIONS.md` (v2.0), `TEST_PLAN.md` (v1.0). `TEST_PLAN.md` là kế hoạch, không phải `TEST_REPORT.md` ghi kết quả.

### 1.1. Tiến độ theo acceptance criteria

> Trạng thái là **ước lượng thận trọng theo tài liệu đã cung cấp**, không phải kết luận về code trên GitHub. Trước khi commit, nhóm kiểm tra và sửa lại theo tiến độ thực tế, bổ sung SHA/đường dẫn bằng chứng. Tài liệu mới cần được đưa lên fork để các đường dẫn file có hiệu lực. Đề chính thức có B-01–B-12.

| Mã | Trạng thái (Chưa / Đang / Xong) | Bằng chứng (commit / CI / file) | Ghi chú |
|---|---|---|---|
| B-01 | Đang | `REQUIREMENTS.md` mục 2, 6 (đặc tả, chưa phải triển khai) | Chưa xác minh UI đã tích hợp |
| B-02 | Đang | `REQUIREMENTS.md` mục 5 (bảng 12 câu dự kiến) | Cần bổ sung thực tế vào `data/seed.json` và kiểm tra DB |
| B-03 | Đang | `REQUIREMENTS.md` mục 3; `DECISIONS.md` ADR-002 | Đã có đặc tả quy tắc tất định; chưa có bằng chứng test code |
| B-04 | Đang | `REQUIREMENTS.md` mục 6; `TEST_PLAN.md` TC-SEC-01 | Chưa có kết quả kiểm tra API thật |
| B-05 | Đang | `DECISIONS.md` ADR-003; `TEST_PLAN.md` TC-SUB-01..03 | Cần code và kiểm thử SQLite |
| B-06 | Đang | `REQUIREMENTS.md` mục 3.4; `DECISIONS.md` ADR-003 | Đã định nghĩa 4 trạng thái, chưa chứng minh chạy được |
| B-07 | Đang | `REQUIREMENTS.md` mục 2.2; `TEST_PLAN.md` TC-AUD-01 | Cần `git diff`/kiểm tra file với baseline |
| B-08 | Đang | `TEST_PLAN.md` mục 3 (kịch bản dự kiến) | Có ma trận test; chưa có bằng chứng test tự động chạy |
| B-09 | Đang | `TEST_PLAN.md` mục 2 (lệnh dự kiến) | Chưa xác nhận `npm test` chạy thành công |
| B-10 | Đang | `TEST_PLAN.md` mục 5 (kế hoạch) | Chưa có run CI thật để dẫn link |
| B-11 | Đang | `REQUIREMENTS.md` mục 2.2; `TEST_PLAN.md` TC-AUD-01 | Cần rà soát repository thực tế |
| B-12 | Đang | `DECISIONS.md` ADR-004; `TEST_PLAN.md` mục 4 | Đã mô tả yêu cầu, cần phát triển và kiểm thử UI |

### 1.2. Sửa đổi bắt buộc từ Checkpoint 1

> Nhận xét nguồn: https://github.com/fossbk-spec/ktpmud-bkt-vuontoan-starter/pull/1. Tình trạng “Đang” nghĩa là tài liệu đã có bản sửa nhưng **chưa đủ bằng chứng áp dụng vào mã nguồn, kiểm thử**; cần đối chiếu sau khi push.

| Mục | Trạng thái | Bằng chứng |
|---|---|---|
| ❗ Không báo cáo 14 Passed/CI xanh nếu chưa có chứng cứ; nêu AI_USE khi có dùng AI | Đang | `TEST_PLAN.md` (chỉ chứa kế hoạch). **Cần sửa `TEST_REPORT.md` cũ** và bổ sung `AI_USE.md` phù hợp |
| ❗ Giới hạn phạm vi nhân/chia | Đang | `REQUIREMENTS.md` mục 2, 5 (bản sửa tài liệu); còn cần kiểm tra fixture code |
| ❗ Quy tắc tất định, không có hai cách hiểu | Đang | `REQUIREMENTS.md` mục 3.2; `DECISIONS.md` ADR-002; cần đối chiếu code & test |
| ❗ Thống nhất định dạng JSON đáp án | Đang | `REQUIREMENTS.md` mục 3.1; `DECISIONS.md` ADR-001 (min, max, canonical, exact); cần áp dụng trong code |

Hai quyết định đã mô tả trong `DECISIONS.md` mới; cần triển khai và kiểm tra thực tế:
- Luồng 'ước lượng trước': nhập/nộp ước lượng ở bước nào; có ép thứ tự ở UI hoặc server không; nhập đúng kết quả vào ô ước lượng có hợp lệ không?
- Quy tắc chấm bốn trạng thái (ước lượng đúng/sai × kết quả đúng/sai); định nghĩa `correct_count`, `score_percent`.

### 1.3. Timeline dự kiến đến khi hoàn thành

> Đây là lịch và vai trò **dự kiến**. Nhóm xác nhận lại phân công, ngày hoàn thành, bằng chứng trước khi nộp. Không ghi nhận test hay CI là đã chạy nếu chưa có link.

| Việc | Vai trò phụ trách | Mốc | Ngày dự kiến |
|---|---|---|---|
| Sửa 4 nhận xét bắt buộc và chốt ADR | Lead + BE/QA | Checkpoint 2 | 15/11/2026 |
| Tạo câu hỏi/fixtures và thuật toán chấm tất định | BE | Checkpoint 2 | 15/11/2026 |
| Tích hợp UI nhập ước lượng trước và feedback | FE | Checkpoint 2 | 15/11/2026 |
| Tích hợp API, SQLite, lưu kết quả, không lộ đáp án | BE | Checkpoint 2 / M3 | 15–17/11/2026 |
| Test normal/boundary/invalid/scoring, `npm test`, CI PR | QA + BE | M3 / PC-2 | 17–18/11/2026 |
| Chuẩn bị Draft PR `submissions/hoang_mai_toan_29/`, validate xanh | Lead | PC-2 | Trước 11:30 18/11/2026 |
| Hoàn thiện README, checklist, AI_USE, CONTRIBUTIONS, slides | Cả nhóm | Freeze | 19/11/2026 |
| Freeze code, tag `bkt-2026-29-rc1` | Lead | Freeze | Trước 23:59 19/11/2026 |
| Cập nhật PR nộp, chuyển Ready for review | Lead | M4 | 20/11/2026 |

### 1.4. Rủi ro / đang vướng

- Test và CI chưa có bằng chứng thực tế: cần ưu tiên thiết lập sớm, không ghi kết quả giả.
- Quy tắc ước lượng, định dạng đáp án, cách chấm và luồng hai bước cần chốt để frontend/backend không làm lệch nhau.
- Nguy cơ không kịp Draft PR hợp lệ trước PC-2 nếu để khâu đóng gói đến cuối.
- Nhóm bổ sung các vướng mắc thực tế nếu có (không tự nhận các mục trên đã được xử lý).

### 1.5. Câu hỏi cho GV

- Q1: Nhóm dự kiến chấp nhận ước lượng bằng đáp án chính xác nếu nằm trong khoảng `[min, max]` và phản hồi thêm gợi ý sư phạm. Thầy có đồng ý cách hiểu này không ạ?
- Q2: Nhóm chọn khóa ô kết quả chính xác ở UI cho đến khi nhập ước lượng, sau đó nộp hai đáp án trong một request để giữ tương thích. Cách kiểm soát ở UI này có đáp ứng yêu cầu “ước lượng trước” không ạ?

### 1.6. Phân công (vai trò dự kiến; nhóm điều chỉnh theo người làm thực tế, KHÔNG ghi tên/MSSV)

| Alias / vai trò | Đầu việc chính | Commit/PR tiêu biểu |
|---|---|---|
| Lead | Tổng hợp tiến độ, tài liệu, chuẩn bị PR nộp bài | PR Checkpoint 1: https://github.com/fossbk-spec/ktpmud-bkt-vuontoan-starter/pull/1 (cần bổ sung commit cá nhân) |
| BE | Logic chấm, API, DB, dữ liệu | PR Checkpoint 1: https://github.com/fossbk-spec/ktpmud-bkt-vuontoan-starter/pull/1 (cần bổ sung commit cá nhân) |
| FE/QA | UI, kiểm thử, CI | PR Checkpoint 1: https://github.com/fossbk-spec/ktpmud-bkt-vuontoan-starter/pull/1 (cần bổ sung commit cá nhân) |

## PC-2 — 18/11/2026

**Tình trạng chung (tại thời điểm chuẩn bị PC-2):** Đã triển khai vertical slice dạng bài ước lượng nhân/chia; nhóm xác nhận ứng dụng web khởi động và sử dụng được. Đã chạy `npm.cmd test` trên Node.js v22.23.4 với **31 passed, 0 failed, 0 skipped** (15/11). Ảnh GitHub Actions cho thấy **6 lượt CI xanh** trên `track-b-main` tính đến 16/11. Đã tạo **Draft PR #36** vào `fossbk-spec/ktpmud-project`, check **Validate Submission / validate: PASS**, bot thông báo bài nộp hợp lệ về cấu trúc. Các đầu việc bảo mật, kiểm thử thủ công đầy đủ, slide và Freeze còn tiếp tục; không coi `validate` là đã được chấm nội dung hay phê duyệt.

### 2.1. Đối chiếu timeline PC-1

| Việc (theo bảng 1.3) | Kế hoạch | Thực tế đến PC-2 | Lệch & lý do |
|---|---|---|---|
| Sửa 4 nhận xét bắt buộc và chốt ADR | 15/11 | Đã cập nhật `REQUIREMENTS.md`, `DECISIONS.md`, `TEST_PLAN.md`; báo cáo test được sửa theo số liệu chạy thật, có `AI_USE.md`. Các test kiểm tra công thức, JSON và thứ tự bước. | Có bằng chứng code/test cho phần chính; vẫn cần rà soát lần cuối mức độ đáp ứng đủ từng nhận xét GV. |
| Tạo câu hỏi/fixtures và thuật toán chấm tất định | 15/11 | Có test `TC-SEED-01` chạy 12 fixture JSON và test quy tắc ước lượng, normal/boundary/invalid, ma trận bốn trạng thái. | Đã có bằng chứng kiểm thử local; cần đối chiếu seed/câu hỏi trên bản release cuối. |
| Tích hợp UI nhập ước lượng trước và feedback | 15/11 | Có test giao diện hai bước, đường dẫn thông báo/hướng dẫn; web mở và sử dụng được. | Chưa có biên bản kiểm thử thủ công đầy đủ trên trình duyệt về feedback, bàn phím và lưu kết quả sau refresh. |
| Tích hợp API, SQLite, lưu kết quả, không lộ đáp án | 15–17/11 | Có test API lessons, không lộ đáp án, kiểm tra 401/404, chấm/lưu kết quả, chống nộp trùng; test chạy local 31/31. | Đạt kiểm thử tự động; chưa đánh đồng với kiểm chứng OAuth/Admin thật trong môi trường triển khai. |
| Test normal/boundary/invalid/scoring, `npm test`, CI PR | 17–18/11 | Đã chạy 31/31 test local PASS; GitHub Actions có các lượt xanh trên `track-b-main`. | Đã có bằng chứng CI xanh trên nhánh; chưa xác minh đầy đủ trigger CI riêng khi mở PR. |
| Chuẩn bị Draft PR `submissions/hoang_mai_toan_29/`, validate xanh | Trước 11:30 18/11 | **Đã mở Draft PR #36** và check `validate` xanh, bot xác nhận hợp lệ về cấu trúc. | Hoàn thành trước PC-2; PR vẫn ở trạng thái Draft. |
| Hoàn thiện README, checklist, AI_USE, CONTRIBUTIONS, slides | 19/11 | Đã đưa README, REQUIREMENTS, DECISIONS, TEST_REPORT, SECURITY_PRIVACY_CHECKLIST, AI_USE, CONTRIBUTIONS vào hồ sơ PR #36. | Tài liệu đã có; slide/demo và rà soát nội dung cuối chưa xác minh hoàn thành, còn hạn 19–20/11. |
| Freeze code, tag `bkt-2026-29-rc1` | Trước 23:59 19/11 | Chưa tới mốc Freeze; `release_tag` trong `source-ref.json` hiện là tên dự kiến. | Chưa tạo/xác minh tag; sẽ chốt SHA cuối khi Freeze. |
| Cập nhật PR nộp, chuyển Ready for review | 20/11 | PR #36 đang Draft, `validate` PASS. | Đúng tiến độ; giữ Draft đến giai đoạn nộp cuối. |

### 2.2. Tiến độ theo acceptance criteria (B-01–B-12)

> “Xong” chỉ thể hiện có bằng chứng kiểm thử tương ứng ở phạm vi hiện tại; không có nghĩa đã hoàn tất mọi kiểm tra triển khai/bảo mật. Các mục còn thiếu xác minh cuối được giữ “Đang”.

| Mã | Trạng thái | Bằng chứng | Ghi chú |
|---|---|---|---|
| B-01 | Xong | `tests/estimate.api.test.js`, `tests/estimate.ui.test.js` | Dạng `estimate` được kiểm tra xuất hiện trong `/api/lessons`; có kiểm thử giao diện hai bước. |
| B-02 | Xong | `tests/estimate.rules.test.js` — `TC-SEED-01` | Chạy và kiểm tra 12 fixture mẫu theo định dạng JSON; kiểm tra tái lập dữ liệu. |
| B-03 | Xong | `DECISIONS.md` ADR-002; `tests/estimate.rules.test.js` | Công thức và tham số ước lượng tất định; kiểm tra ba loại câu và từ chối đầu vào sai. |
| B-04 | Xong | `tests/estimate.api.test.js` — `TC-SEC-01` | GET câu hỏi không tiết lộ đáp án; endpoint yêu cầu đăng nhập trả 401. |
| B-05 | Xong | `tests/estimate.api.test.js` — `TC-SUB-01/02/03` | Kiểm tra chấm, lưu, 404 khi không tồn tại, chống gửi trùng; test dùng SQLite local. |
| B-06 | Đang | `tests/estimate.rules.test.js` — `TC-SCORE-06`; `DECISIONS.md` ADR-003 | Chấm bốn trạng thái và `scorePercent`/`correctCount` có test; cần xác nhận đầy đủ feedback trên trình duyệt. |
| B-07 | Đang | `tests/estimate.rules.test.js` — `B-07`; `TC-REG-01` | Có test chặn sửa file cấm và hồi quy bài cũ; cần rà soát `git diff` cuối với starter tag. |
| B-08 | Xong | `tests/estimate.rules.test.js`, `tests/estimate.api.test.js` | Đã kiểm thử normal, boundary, invalid input và các kết quả chấm. |
| B-09 | Xong | `package.json`; `TEST_REPORT.md`; ảnh Terminal 15/11 | `npm.cmd ci` thành công; `npm.cmd test`: 31 pass, 0 fail, 0 skipped; Node v22.23.4. |
| B-10 | Đang | `.github/workflows/`; https://github.com/TRuong-c/ktpmud-bkt-vuontoan-starter/actions | Ảnh GitHub cho thấy CI xanh trên `track-b-main`; chưa xác minh đầy đủ việc CI chạy khi mở PR. |
| B-11 | Đang | `SECURITY_PRIVACY_CHECKLIST.md`; test 401/không lộ đáp án | Còn hai cảnh báo npm (1 moderate, 1 high); cần rà soát secret/PII và OAuth/Admin thực tế. |
| B-12 | Đang | `tests/estimate.ui.test.js` | Có test hướng dẫn, trang estimate, luồng hai bước; cần thử đầy đủ bàn phím, focus và thông báo lỗi bằng tay. |

### 2.3. Sẵn sàng nộp bài

| Deliverable | Có / Chưa | Đường dẫn / trạng thái |
|---|---|---|
| README.md (cài đặt/chạy/test) | Có | `README.md` trên fork mã nguồn và `submissions/hoang_mai_toan_29/README.md` trong PR #36 |
| REQUIREMENTS.md | Có | `REQUIREMENTS.md`; `submissions/hoang_mai_toan_29/artifacts/REQUIREMENTS.md` |
| DECISIONS.md / ADR | Có | `DECISIONS.md`; `submissions/hoang_mai_toan_29/artifacts/DECISIONS.md` |
| Test tự động + CI xanh | Có, cần xác nhận thêm trigger PR | `tests/`; `package.json`; https://github.com/TRuong-c/ktpmud-bkt-vuontoan-starter/actions |
| TEST_REPORT.md | Có | `TEST_REPORT.md`; `submissions/hoang_mai_toan_29/artifacts/TEST_REPORT.md` |
| SECURITY_PRIVACY_CHECKLIST.md | Có tài liệu, còn rủi ro | `submissions/hoang_mai_toan_29/artifacts/SECURITY_PRIVACY_CHECKLIST.md` |
| AI_USE.md | Có | `AI_USE.md`; `submissions/hoang_mai_toan_29/artifacts/AI_USE.md` |
| CONTRIBUTIONS.md | Có tài liệu | `submissions/hoang_mai_toan_29/artifacts/CONTRIBUTIONS.md`; phân công cá nhân chỉ dựa trên bằng chứng đã xác minh |
| Slide/demo script ≤ 7 phút | Chưa xác minh hoàn thành | `submissions/hoang_mai_toan_29/slides/` còn cần kiểm tra và bổ sung bản demo thực tế |
| Draft PR vào `ktpmud-project`, check `validate` xanh | **Có — PASS** | https://github.com/fossbk-spec/ktpmud-project/pull/36 (Draft, bot thông báo bài nộp hợp lệ về cấu trúc) |

**Kết quả có bằng chứng:** local Node.js v22.23.4, `npm.cmd test` thực thi 31 test (**31 passed, 0 failed, 0 skipped**) ngày 15/11; ảnh GitHub Actions ngày 16/11 cho thấy 6 workflow runs xanh; PR #36 có check `Validate Submission / validate` thành công. Trạng thái xanh của bài nộp là **kiểm tra cấu trúc**, không thay thế review nội dung. Ứng dụng web được nhóm xác nhận mở/sử dụng được, nhưng chưa có kết quả ghi chép riêng cho toàn bộ kịch bản thủ công.

**Liên kết bằng chứng chính:**

- Fork: https://github.com/TRuong-c/ktpmud-bkt-vuontoan-starter/tree/track-b-main
- Test: https://github.com/TRuong-c/ktpmud-bkt-vuontoan-starter/tree/track-b-main/tests
- CI: https://github.com/TRuong-c/ktpmud-bkt-vuontoan-starter/actions
- TEST_REPORT: https://github.com/TRuong-c/ktpmud-bkt-vuontoan-starter/blob/track-b-main/TEST_REPORT.md
- Draft PR nộp bài: https://github.com/fossbk-spec/ktpmud-project/pull/36

### 2.4. Việc còn lại đến Freeze (23:59 19/11)

| Việc | Vai trò phụ trách | Hạn |
|---|---|---|
| Xác minh CI có trigger Pull Request và lưu link run cụ thể | QA + BE | 18–19/11 |
| Chạy `npm audit`, đánh giá hai cảnh báo phụ thuộc (moderate/high), ghi cách xử lý hoặc lý do chưa sửa | BE + QA | 19/11 |
| Rà soát không có secret, `.env`, token, dữ liệu cá nhân thật trong repository và bài nộp | Lead + BE | 19/11 |
| Thử trực tiếp luồng ước lượng → tính đúng → nộp → nhận feedback → tải lại; kiểm tra bàn phím/focus/lỗi | FE + QA | 19/11 |
| Kiểm tra diff với starter để xác nhận không sửa file bị cấm; cập nhật hồ sơ theo đúng code | BE + Lead | 19/11 |
| Hoàn thiện slide/kịch bản demo tối đa 7 phút | Cả nhóm | 19–20/11 |
| Freeze mã nguồn, tạo tag `bkt-2026-29-rc1` và lấy SHA 40 ký tự | Lead + BE | Trước 23:59 19/11 |
| Cập nhật `final_commit`, tag và link CI cuối trong `source-ref.json` của **chính PR #36** | Lead | 20/11 |
| Chuyển PR #36 từ Draft sang Ready for review sau khi kiểm tra `validate` xanh | Lead | 20/11 |

### 2.5. Rủi ro / câu hỏi cho GV

- **R1 — Dependency:** `npm ci` từng thông báo 2 lỗ hổng (1 moderate, 1 high). Nhóm chưa có bằng chứng đã khắc phục; sẽ đánh giá bằng `npm audit` trước Freeze, tránh nâng cấp phá tương thích.
- **R2 — Xác thực:** Log local cho thấy Google OAuth và `ADMIN_SECRET` chưa được cấu hình trong môi trường test. Các kiểm thử 401 và phân quyền không được suy diễn thành kiểm thử OAuth/production hoàn chỉnh.
- **R3 — Thử tay/UI:** Nhóm xác nhận ứng dụng chạy được, nhưng cần kiểm tra đầy đủ feedback, lưu tiến độ sau refresh và thao tác bàn phím.
- **R4 — CI:** Có run xanh trên nhánh; cần kiểm tra riêng workflow có trigger Pull Request theo yêu cầu B-10.
- **R5 — Freeze/bàn giao:** PR #36 hợp lệ về cấu trúc; tag và SHA release vẫn chưa chốt, slide/demo cần hoàn thiện.

**Câu hỏi còn mở (không tự coi là đã được GV đồng ý):**

- Q1 từ PC-1: Ước lượng trùng đáp án chính xác nhưng thuộc `[min, max]` có được chấp nhận với phản hồi sư phạm không? Nhóm đã triển khai/kiểm thử theo quy tắc đã mô tả; cần đối chiếu trả lời chính thức nếu có.
- Q2 từ PC-1: Khóa ô kết quả chính xác ở UI, rồi nộp hai đáp án trong một request có đáp ứng đầy đủ yêu cầu “ước lượng trước” không? Nhóm có test UI hai bước; cần xác nhận chính thức nếu có yêu cầu khác.

**Kết luận PC-2:** Nhóm 29 đã có vertical slice Track B, 31/31 test local PASS, CI xanh trên nhánh và Draft PR #36 đạt `validate`. Các nội dung bảo mật, CI trigger PR, manual UI, slide và release tag tiếp tục được hoàn thiện trước Freeze. **Việc xác nhận PC-2 với GV chỉ hoàn tất sau khi commit bản `PROGRESS.md` này lên `track-b-main` và comment đúng giờ tại Issue #18, dẫn SHA của commit đó.**

## Kết quả cuối — Freeze 19/11/2026

- Tag: `bkt-2026-29-rc1` · SHA: **Chưa tạo/chưa xác minh — cập nhật khi Freeze ngày 19/11**.
- Trạng thái cuối từng mã AC: **Chưa chốt — cập nhật sau khi rà soát code, bảo mật, CI và demo ở mốc Freeze**.
- Những việc trong timeline chưa hoàn thành và lý do: **Chốt tại Freeze; xem danh sách còn mở ở mục PC-2 §2.4–2.5**.
