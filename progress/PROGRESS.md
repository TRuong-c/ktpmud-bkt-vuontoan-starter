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
| B-01 | Chưa | `REQUIREMENTS.md` mục 2, 6 (đặc tả, chưa phải triển khai) | Chưa xác minh UI đã tích hợp |
| B-02 | Đang | `REQUIREMENTS.md` mục 5 (bảng 12 câu dự kiến) | Cần bổ sung thực tế vào `data/seed.json` và kiểm tra DB |
| B-03 | Đang | `REQUIREMENTS.md` mục 3; `DECISIONS.md` ADR-002 | Đã có đặc tả quy tắc tất định; chưa có bằng chứng test code |
| B-04 | Đang | `REQUIREMENTS.md` mục 6; `TEST_PLAN.md` TC-SEC-01 | Chưa có kết quả kiểm tra API thật |
| B-05 | Đang | `DECISIONS.md` ADR-003; `TEST_PLAN.md` TC-SUB-01..03 | Cần code và kiểm thử SQLite |
| B-06 | Đang | `REQUIREMENTS.md` mục 3.4; `DECISIONS.md` ADR-003 | Đã định nghĩa 4 trạng thái, chưa chứng minh chạy được |
| B-07 | Đang | `REQUIREMENTS.md` mục 2.2; `TEST_PLAN.md` TC-AUD-01 | Cần `git diff`/kiểm tra file với baseline |
| B-08 | Đang | `TEST_PLAN.md` mục 3 (kịch bản dự kiến) | Có ma trận test; chưa có bằng chứng test tự động chạy |
| B-09 | Chưa | `TEST_PLAN.md` mục 2 (lệnh dự kiến) | Chưa xác nhận `npm test` chạy thành công |
| B-10 | Chưa | `TEST_PLAN.md` mục 5 (kế hoạch) | Chưa có run CI thật để dẫn link |
| B-11 | Đang | `REQUIREMENTS.md` mục 2.2; `TEST_PLAN.md` TC-AUD-01 | Cần rà soát repository thực tế |
| B-12 | Chưa | `DECISIONS.md` ADR-004; `TEST_PLAN.md` mục 4 | Đã mô tả yêu cầu, cần phát triển và kiểm thử UI |

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

> Chừa phần này để cập nhật vào ngày 18/11. Không xóa hoặc sửa các nội dung PC-1 sau khi đã nộp.

### 2.1. Đối chiếu timeline PC-1

| Việc (theo bảng 1.3) | Kế hoạch | Thực tế | Lệch & lý do |
|---|---|---|---|

### 2.2. Tiến độ theo acceptance criteria (cập nhật B-01–B-12)

| Mã | Trạng thái | Bằng chứng | Ghi chú |
|---|---|---|---|

### 2.3. Sẵn sàng nộp bài

| Deliverable | Có / Chưa | Đường dẫn |
|---|---|---|
| README.md (cài đặt/chạy/test) | | |
| REQUIREMENTS.md | | |
| DECISIONS.md / ADR | | |
| Test tự động + CI xanh | | |
| TEST_REPORT.md | | |
| SECURITY_PRIVACY_CHECKLIST.md | | |
| AI_USE.md | | |
| CONTRIBUTIONS.md | | |
| Slide/demo script <= 7 phút | | |
| Draft PR vào `ktpmud-project`, check `validate` xanh | | |

### 2.4. Việc còn lại đến Freeze (23:59 19/11)

| Việc | Vai trò phụ trách | Hạn |
|---|---|---|

### 2.5. Rủi ro / câu hỏi cho GV

- ĐIỀN ngày 18/11.

## Kết quả cuối — Freeze 19/11/2026

- Tag: `bkt-2026-29-rc1` · SHA: ĐIỀN KHI FREEZE
- Trạng thái cuối từng mã AC: ĐIỀN KHI FREEZE
- Những việc trong timeline chưa hoàn thành và lý do: ĐIỀN KHI FREEZE
