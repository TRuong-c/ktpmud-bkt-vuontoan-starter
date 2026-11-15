---
title: "Báo cáo Sử dụng Công cụ Trí tuệ Nhân tạo (AI_USE.md) — Track B: Vườn Toán Lớp 3"
document_id: "KTPMUD-2026-TRACKB-AI-USE"
version: "1.0.0"
date: "2026-11-10"
track: "Track B — Vườn Toán Lớp 3 (hoang_mai_toan)"
repository: "ktpmud-bkt-vuontoan-starter"
---

# BÁO CÁO SỬ DỤNG CÔNG CỤ TRÍ TUỆ NHÂN TẠO (AI_USE.md)
**Dự án:** Vườn Toán Lớp 3 — Thêm dạng bài *"Ước lượng kết quả trước khi tính đúng"* (Track B)

> Tài liệu này tuân thủ quy định về liêm chính học thuật và chính sách sử dụng AI của môn học Kỹ thuật Phần mềm Ứng dụng (KTPMUD Hack Marathon 2026 — Mục 6 & Mục 11). Nhóm cam kết công khai, minh bạch toàn bộ các công cụ trợ lý AI đã sử dụng, mục đích, kết quả thu được, các sai lệch phát sinh ban đầu và quá trình rà soát, kiểm chứng của các thành viên trong nhóm.

---

## 1. Danh sách Công cụ AI Sử dụng

1. **Công cụ chính:** Google Antigravity (mô hình Gemini 2.5 Pro / Flash).
2. **Môi trường sử dụng:** Trợ lý lập trình AI hỗ trợ trực tiếp trong môi trường IDE/Terminal phát triển cục bộ.

---

## 2. Nhật ký & Mục đích Sử dụng AI theo Từng Giai đoạn

| Giai đoạn | Mục đích sử dụng AI | Câu lệnh / Prompt chính | Kết quả do AI sinh ra | Mức độ can thiệp & Đóng góp |
| :--- | :--- | :--- | :--- | :--- |
| **M1 — Phân tích Yêu cầu** | Hỗ trợ đọc đề bài, tóm tắt các ràng buộc B-01 đến B-12 và lập dàn ý tài liệu `REQUIREMENTS.md`. | *"Hãy phân tích đề bài Track B Vườn toán lớp 3 và lập dàn ý đặc tả các yêu cầu B-01 đến B-12..."* | Bản thảo dàn ý tài liệu đặc tả, danh mục các bảng yêu cầu Given/When/Then. | AI hỗ trợ soạn khung (draft); nhóm rà soát và tinh chỉnh nội dung nghiệp vụ. |
| **M1 — Vẽ Sơ đồ Hệ thống** | Hỗ trợ sinh mã sơ đồ Use Case và Activity theo định dạng XML Draw.io và mã vector SVG. | *"Vẽ sơ đồ use case và activity dạng 2 cột theo phong cách Đại học Bách Khoa cho học sinh và giáo viên..."* | Mã nguồn 4 sơ đồ Use Case và Activity Swimlane 2 cột (`docs/*.svg`). | AI sinh mã vector SVG; nhóm rà soát luồng nghiệp vụ trên Draw.io. |
| **M1 — Lập Kế hoạch Kiểm thử & ADR** | Hỗ trợ phác thảo các quyết định kiến trúc (`DECISIONS.md`) và ma trận test case (`TEST_PLAN.md`). | *"Thiết kế ma trận test cases cho normal, boundary, invalid input và scoring..."* | Dự thảo 5 ADR và bảng 28 kịch bản test case. | AI hỗ trợ đề xuất ma trận; nhóm thẩm định công thức và logic tính điểm. |

---

## 3. Ghi nhận Sai lệch Ban đầu của AI và Quá trình Sửa chữa của Nhóm (Theo Nhận xét Checkpoint 1)

Trong quá trình nộp bài Checkpoint 1, nhóm đã ghi nhận một số lỗi do công cụ AI tự động tạo ra trong các bản thảo sơ khởi và nhóm đã tiến hành rà soát, loại bỏ hoàn toàn:

1. **Lỗi sinh dữ liệu kết quả kiểm thử ảo trong `TEST_REPORT.md`:**
   - *Hiện tượng:* Trợ lý AI khi sinh file `TEST_REPORT.md` ban đầu đã tự động điền các thông số giả định *"14 Passed, 0 Failed, CI xanh 100%"* mặc dù dự án ở M1 chưa có mã nguồn thực thi hay workflow CI thật.
   - *Xử lý của nhóm:* Nhóm đã phát hiện và tiếp thu nghiêm túc nhận xét của Thầy; tiến hành **xóa bỏ toàn bộ các kết quả ảo**, đưa `TEST_REPORT.md` về dạng **Khung chuẩn (Skeleton/Template)**; chỉ cập nhật số liệu khi chạy lệnh thật trên máy và CI trong giai đoạn M2 và M3.

2. **Lỗi sinh câu hỏi và quy tắc ngoài phạm vi phép tính (§8.2):**
   - *Hiện tượng:* AI đã đưa vào một số ví dụ phép cộng/trừ 3 chữ số và làm tròn hàng trăm (như `est-7: 712 - 295`) và công thức dung sai có chữ "hoặc" gây mâu thuẫn với yêu cầu *"trên các phép nhân/chia đã có"*.
   - *Xử lý của nhóm:* Nhóm đã loại bỏ toàn bộ các câu hỏi phép cộng/trừ, chuyển **100% 12 câu hỏi synthetic sang phép nhân và phép chia** (Bảng nhân 6, 7, 8, 9 và nhân/chia số có 2 chữ số thuộc các bài 9, 10, 11, 12, 13, 14, 23, 26 có sẵn trong SGK), đồng thời chuẩn hóa công thức toán học tất định duy nhất cho từng loại câu.

3. **Lỗi không thống nhất tên trường dữ liệu trong các tài liệu:**
   - *Hiện tượng:* AI dùng không đồng nhất giữa `min_estimate`/`exact_answer` trong ADR và `min`/`max`/`exact` trong Requirements.
   - *Xử lý của nhóm:* Nhóm đã thống nhất dứt khoát một định dạng mã hóa JSON duy nhất: `{"min":..., "max":..., "exact":..., "canonical":...}` trên toàn bộ hệ thống tài liệu.

---

## 4. Phân công Trách nhiệm & Thẩm định của Thành viên Nhóm

| Thành viên | Vai trò trong nhóm | Nội dung chịu trách nhiệm rà soát & thẩm định độc lập |
| :--- | :--- | :--- |
| **Trưởng nhóm** | Quản lý dự án, Kiến trúc | Thẩm định tính khả thi của 5 Quyết định Kiến trúc trong `DECISIONS.md`, kiểm soát tính bảo mật API (`B-04`) và quy chế phạm vi (`B-07`). |
| **Thành viên 1** | Phân tích Nghiệp vụ (BA) | Thẩm định logic toán học, kiểm tra 12 fixtures nhân/chia trong `REQUIREMENTS.md` và 4 sơ đồ Use Case/Activity. |
| **Thành viên 2** | Kiểm thử & QA | Thẩm định ma trận test trong `TEST_PLAN.md`, chịu trách nhiệm chạy test thật và ghi nhận nhật ký vào `TEST_REPORT.md` ở giai đoạn M2. |

> **Cam kết:** Toàn bộ thành viên trong nhóm hiểu rõ mọi nội dung trong tài liệu đã nộp, sẵn sàng trả lời độc lập và giải trình trực tiếp trong các buổi Demo/Viva với Thầy và Trợ giảng.
