---
title: "Báo cáo Kết quả Kiểm thử (TEST_REPORT.md) — Track B: Vườn Toán Lớp 3"
document_id: "KTPMUD-2026-TRACKB-TEST-REPORT"
version: "1.0.1-draft"
date: "2026-11-15"
track: "Track B — Vườn Toán Lớp 3 (hoang_mai_toan)"
repository: "ktpmud-bkt-vuontoan-starter"
status: "DRAFT_TEMPLATE — kết quả chạy thật chưa được nhóm xác nhận"
---

# BÁO CÁO KẾT QUẢ KIỂM THỬ (TEST_REPORT.md)
**Dự án:** Vườn Toán Lớp 3 — Mở rộng dạng bài *"Ước lượng kết quả trước khi tính đúng"* (Track B)

> [!IMPORTANT]
> **Ghi chú tuân thủ quy chế thi (Cập nhật sau nhận xét Checkpoint 1):**
> Tại mốc **Checkpoint 1 (M1 — Understand)**, nhóm đã soạn tài liệu phân tích yêu cầu (`REQUIREMENTS.md`), quyết định kiến trúc (`DECISIONS.md`) và lập ma trận kế hoạch kiểm thử (`TEST_PLAN.md`). Mã nguồn tính năng, lệnh `npm test` và GitHub Actions CI thuộc giai đoạn **M2 — Build (09–15/11/2026)** và **M3 — Harden (16–19/11/2026)**. Trước khi nộp, nhóm cần cập nhật mục này theo tình trạng thực tế của commit được báo cáo; không suy diễn trạng thái chỉ từ kế hoạch.
> 
> Báo cáo này được thiết lập ở **DẠNG KHUNG CHUẨN (Skeleton/Template)**. Mọi kết quả kiểm thử thực tế (kết quả pass/fail, nhật ký chạy lệnh, thông tin môi trường thật và link CI Run) sẽ được đo đạc và điền vào sau khi chạy thực tế trong giai đoạn M2 và M3, tuyệt đối không ghi kết quả giả định.

---

## 1. Môi trường Thực thi Thử nghiệm (Sẽ điền thông số thật ở M2)

| Thông số môi trường | Giá trị dự kiến / Cấu hình mục tiêu | Giá trị ghi nhận thực tế (Cập nhật ở M2) |
| :--- | :--- | :--- |
| **Hệ điều hành kiểm thử** | Windows 11 / Ubuntu 22.04 LTS (CI) | *[Chờ ghi nhận]* |
| **Phiên bản Node.js** | Node.js `v20.x LTS` hoặc `v22.x LTS` | *[Chờ ghi nhận: `node -v`]* |
| **Phiên bản npm** | npm `10.x+` | *[Chờ ghi nhận: `npm -v`]* |
| **Test Runner** | `node:test` + `node:assert/strict` (Native) | *[Chờ ghi nhận]* |
| **Cơ chế cô lập CSDL** | SQLite tạm thời qua biến môi trường `DB_PATH` | *[Chờ ghi nhận]* |
| **Commit SHA kiểm thử** | Commit hash trên nhánh làm việc | *[Chờ ghi nhận]* |
| **Thời gian thực thi** | Ngày/giờ chạy test | *[Chờ ghi nhận]* |

---

## 2. Lệnh Thực thi Kiểm thử Dự kiến

Theo đúng quyết định kiến trúc tại `DECISIONS.md` (ADR-005) và kế hoạch kiểm thử tại `TEST_PLAN.md`:

```bash
# 1. Cài đặt phụ thuộc sạch từ package-lock.json
npm ci

# 2. Chạy toàn bộ các bộ kiểm thử tự động
npm test
```

---

## 3. Khung Tổng hợp Kết quả Kiểm thử (Execution Summary Template)

*(Đây là số lượng **ca kiểm thử theo kế hoạch**, không phải số test đã triển khai. Các nhóm con Unit: 5 + 7 + 9 = 21; cộng Integration 5 và Regression/Audit 2 = 28. Cần đối chiếu với `TEST_PLAN.md` để bảo đảm không thiếu/trùng ID; số test thực tế lấy từ output `npm test`.)*

| Phân tầng kiểm thử | Tổng số Test Cases | Số Test Đạt (Passed) | Số Test Thất bại (Failed) | Thời gian chạy (ms) | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Tầng 1: Unit Tests (Hàm chấm tất định)** | 21 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| • Normal Cases (`TC-NORM-01..05`) | 5 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| • Boundary Cases (`TC-BND-01..07`) | 7 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| • Invalid Input Cases (`TC-INV-01..09`) | 9 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| **Tầng 2: Integration Tests (API + DB SQLite)** | 5 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| • Fixture Seed (`TC-SEED-01`) | 1 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| • Bảo mật ẩn đáp án (`TC-SEC-01`) | 1 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| • Nộp bài & Lưu DB SQLite (`TC-SUB-01..03`)| 3 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| **Tầng 3: Regression & Audit Tests** | 2 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| • Hồi quy 4 loại câu hỏi cũ (`TC-REG-01`) | 1 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| • Bất biến Auth & Dockerfile (`TC-AUD-01`) | 1 | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ Pending (M2) |
| **TỔNG CỘNG** | **28** | *[Chờ chạy M2]* | *[Chờ chạy M2]* | *[ms]* | ⏳ **Pending (M2)** |

---

## 4. Nhật ký Thực thi Mẫu từ Terminal (Raw Console Output)

*(Dán log từ terminal khi nhóm thực sự chạy `npm test`, kèm commit SHA và thời gian.)*

```text
[Chờ dán log thực tế sau khi chạy `npm test` ở M2]
```

---

## 5. Kết quả Kiểm thử Tự động trên CI (GitHub Actions Run)

- **Workflow File:** `.github/workflows/ci.yml` (Được cấu hình ở M3)
- **Link Run trên GitHub Actions:** *[Sẽ cập nhật URL thật của GitHub Actions Run sau khi hoàn thiện CI]*
- **Trạng thái Build:** ⏳ *Chờ cấu hình ở M3*

---

## 6. Giới hạn & Các vấn đề còn tồn đọng (Known Issues & Limitations)

*(Sẽ ghi nhận các trường hợp biên hoặc hạn chế phát hiện trong quá trình kiểm thử thực tế ở M2 và M3).*
- Tình trạng cần nhóm xác nhận trước khi commit: đã có code tính năng `estimate` hay chưa, `npm test` có chạy được không, CI nào đã chạy, lỗi hiện còn gì. Không giữ dòng này ở dạng mô tả M1 nếu code đã được triển khai.
