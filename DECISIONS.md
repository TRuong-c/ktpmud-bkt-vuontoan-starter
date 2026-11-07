# Architectural Decisions (DECISIONS.md) — Track B

Tài liệu này ghi lại các quyết định kiến trúc cốt lõi cho tính năng mở rộng **"Ước lượng kết quả trước khi tính đúng"** dựa trên mã nguồn hiện có `ktpmud-bkt-vuontoan-starter`.

---

## ADR: Mở rộng Type câu hỏi `estimate` và Mã hóa Đáp án Tất định

* **Trạng thái:** Accepted
* **Ngày:** 07/11/2026
* **Tuân thủ:** B-02, B-03, B-07

### 1. Bối cảnh
Mã nguồn starter hiện có 4 `type` câu hỏi (`multiple-choice`, `input`, `compare`, `paint`) với cơ chế so sánh chuỗi chính xác (`given === correct_answer`). Các type này không hỗ trợ chấm khoảng ước lượng hoặc chấm 2 bước.

### 2. Quyết định Kiến trúc
- **Giữ nguyên các type cũ (B-07):** Thêm `type` mới tên là `estimate` để không ảnh hưởng tới dữ liệu cũ.
- **Mã hóa trong `correct_answer`:** Với `type='estimate'`, trường `correct_answer` lưu dưới dạng chuỗi JSON tất định:
  ```json
  {
    "min_estimate": 200,
    "max_estimate": 300,
    "exact_answer": 258
  }