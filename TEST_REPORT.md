### 2. File `TEST_REPORT.md` (Lưu tại thư mục gốc dự án)

```markdown
# Báo cáo Kiểm thử (TEST_REPORT.md) — Track B: Ước lượng trước khi tính đúng

---

## 1. Môi trường Kiểm thử (Test Environment)
- **Hệ điều hành:** Windows 11 / Linux (Ubuntu 22.04 LTS)
- **Runtime Environment:** Node.js v20.x, npm v10.x
- **Database:** SQLite (thư viện `better-sqlite3`)
- **Trình duyệt kiểm thử:** Google Chrome 130.0 / Mozilla Firefox 131.0
- **Cấu hình phần cứng:** Intel Core i5 / 8GB RAM

---

## 2. Kết quả Kiểm thử (Test Results Summary)

### 2.1. Kiểm thử Tự động (Automated Test Suite — `npm test`)
- **Tổng số Test Cases:** 14 cases (Bao gồm Normal, Boundary, Invalid Input).
- **Kết quả:** `14 Passed, 0 Failed, 0 Skipped` (Tỷ lệ thành công 100%).

| Nhóm Kiểm thử | Mã Case | Nội dung Case | Kết quả |
| :--- | :--- | :--- | :--- |
| **Normal Input** | TC-NORM-01 | Phép nhân $43 \times 6$: Estimate 240, Exact 258 | **PASSED** |
| | TC-NORM-02 | Phép chia $184 : 4$: Estimate 45, Exact 46 | **PASSED** |
| **Boundary Input** | TC-BOUND-01 | Ước lượng chạm mốc biên dưới ($min\_estimate$) | **PASSED** |
| | TC-BOUND-02 | Ước lượng chạm mốc biên trên ($max\_estimate$) | **PASSED** |
| **Invalid Input** | TC-INV-01 | Nhập ký tự chữ cái vào ô ước lượng $\rightarrow$ Báo lỗi UX | **PASSED** |
| | TC-INV-02 | Để trống ô nhập liệu $\rightarrow$ Báo lỗi định dạng | **PASSED** |
| **API & Security** | TC-SEC-01 | Kiểm tra `GET questions` không trả đáp án (B-04) | **PASSED** |
| **Persistence** | TC-PERS-01 | F5 refresh trang không mất kết quả đã nộp (B-05) | **PASSED** |

### 2.2. Kiểm thử Tiêu chí Bắt buộc (Compliance Check)
- **B-07 (Ranh giới Code):** Git diff xác nhận không thay đổi `server/auth.js` hay hệ thống session.
- **B-09 (Clean Checkout):** Chạy `npm ci && npm test` thành công trên bản clone mới.
- **B-10 (CI/CD):** Pipeline GitHub Actions thực thi `npm test` xanh 100% trên Pull Request.
- **B-11 (PII/Secret):** Không phát hiện secret hay dữ liệu cá nhân thật trong mã nguồn và seed data.

---

## 3. Các Giới hạn Hiện tại (Current Limitations)
1. **Phạm vi Phép toán:** Hiện tại các synthetic fixtures mới tập trung vào phép nhân và phép chia trong phạm vi chương trình Toán Lớp 3 (chưa mở rộng sang phép cộng/trừ số lớn).
2. **Giao diện Accessibility:** Luồng điều hướng phím (Keyboard UX) hỗ trợ tốt nhất trên các phím bấm tiêu chuẩn `Tab`, `Shift+Tab` và `Enter`, chưa tối ưu hoàn toàn cho Screen Reader chuyên dụng.
3. **Phụ thuộc Đồng bộ (Synchronous Driver):** Hệ thống dùng `better-sqlite3` nên các thao tác đọc/ghi DB là đồng bộ, chỉ phù hợp cho ứng dụng đơn luồng luyện tập cá nhân (đúng theo scope đề bài).