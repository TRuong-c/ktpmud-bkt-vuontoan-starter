---
title: "Đặc tả Yêu cầu Phần mềm (REQUIREMENTS.md) — Track B: Vườn Toán Lớp 3"
document_id: "KTPMUD-2026-TRACKB-REQUIREMENTS"
version: "2.1.0"
date: "2026-11-09"
track: "Track B — Vườn Toán Lớp 3 (hoang_mai_toan)"
repository: "ktpmud-bkt-vuontoan-starter"
---

# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (REQUIREMENTS.md)
**Chủ đề Track B:** Vườn Toán Lớp 3 — Thêm dạng luyện tập *"Ước lượng kết quả trước khi tính đúng"* trên các phép nhân/chia đã có.

---

## 1. Giới thiệu & Bối cảnh nghiệp vụ (Business Context)

### 1.1. Hiện trạng hệ thống (Baseline System)
Ứng dụng web **Vườn Toán Lớp 3 — Trường Tiểu học Hoàng Mai** hiện cung cấp môi trường học tập, luyện tập và kiểm tra môn Toán lớp 3 (Chương trình GDPT 2018) với lộ trình 81 bài học (`data/seed.json`, `data/curriculum.json`). Trong đó, mạch kiến thức trọng tâm đang được triển khai luyện tập sâu là **các bảng nhân, bảng chia (6, 7, 8, 9) và phép nhân/chia số có hai chữ số với số có một chữ số** (từ `bai-9` đến `bai-15`, `bai-23`, `bai-26`).

Hệ thống hiện có chỉ hỗ trợ **4 loại câu hỏi (`type`)** với cơ chế chấm điểm **1 bước — so khớp chuỗi ký tự tuyệt đối** (`given === correct_answer`):
- `multiple-choice`: Chọn 1 đáp án trắc nghiệm (`A`, `B`, `C`, `D`).
- `input`: Điền kết quả số cố định (ví dụ: `"54 : 6 = ?"` $\rightarrow$ `"9"`).
- `compare`: Điền dấu so sánh (`">"`, `"<"`, `"="`).
- `paint`: Tô màu thẻ phép tính theo kết quả (`"green"`, `"yellow"`).

### 1.2. Nhu cầu mở rộng nghiệp vụ (Mục 8.2 Đề thi)
Khi học sinh lớp 3 thực hiện các phép nhân và phép chia (đặc biệt là bảng nhân/chia 6, 7, 8, 9 hoặc nhân/chia số có hai chữ số với số có một chữ số), học sinh thường mắc lỗi tính nhầm hàng chục hoặc quên nhớ mà không tự nhận ra kết quả vô lý.

Do đó, hệ thống cần bổ sung dạng luyện tập mới: **"Ước lượng kết quả trước khi tính đúng" (`type = 'estimate'`)** ngay trên các phép nhân/chia đã có:
1. **Bước 1 (Ước lượng trước):** Học sinh phải đưa ra một số ước lượng (hoặc giá trị nằm trong khoảng hợp lý `[min, max]`) cho tích/thương **trước khi** thực hiện bước tính chính xác.
2. **Bước 2 (Tính đúng sau):** Học sinh nhập kết quả tính chính xác (`exact`) của phép nhân/chia đó.
3. **Phản hồi sư phạm kép (`B-06`):** Sau khi nộp bài, hệ thống chấm điểm tất định trên Server và trả về nhận xét phân biệt rõ ràng giữa việc học sinh *"ước lượng hợp lý"* hay chưa và *"kết quả chính xác"* đúng hay sai.

---

## 2. Phạm vi dự án (Project Scope)

### 2.1. Trong phạm vi (In-Scope)
1. **Tích hợp vào luồng học hiện có (`B-01`):** Gắn dạng bài *"Ước lượng kết quả trước khi tính đúng"* trực tiếp vào các bài học nhân/chia sẵn có trên hệ thống (truy cập từ Trang chủ / Mục lục SGK `muc-luc.html` $\rightarrow$ `lesson.html` và Phiếu luyện tập `exercise.html`), tuyệt đối không tạo trang demo rời.
2. **Ngân hàng 12+ câu hỏi synthetic tái lập được (`B-02`):** Bổ sung tối thiểu **12 câu hỏi mẫu** thuộc chủ đề phép nhân và phép chia lớp 3 vào `data/seed.json`.
3. **Quy tắc toán học tất định & Chấm điểm Server-side (`B-03`, `B-04`, `B-05`, `B-06`):**
   - Định nghĩa công thức xác định khoảng ước lượng hợp lý `[min, max]` và đáp số `exact` hoàn toàn bằng thuật toán tất định (không dùng LLM).
   - Ẩn toàn bộ đáp án đúng và khoảng ước lượng khỏi phản hồi của API lấy đề bài (`GET /api/question-sets/:setId/questions`).
   - Chấm điểm, lưu lịch sử (`attempts`), cập nhật tiến độ (`progress`), cộng sao thưởng (`users.total_stars`) bền vững qua các lần tải lại trang (`F5`).
4. **Trải nghiệm bàn phím & Khả năng tiếp cận (`B-12`):** Cho phép học sinh hoàn thành toàn bộ luồng nhập 2 bước và nộp bài bằng bàn phím (`Tab`, `Shift+Tab`, `Enter`), kèm thông báo lỗi tiếng Việt dễ hiểu khi nhập dữ liệu không hợp lệ.

### 2.2. Ngoài phạm vi & Ràng buộc bất biến (Out-of-Scope — Mục 8.4 & B-07, B-11)

> [!CAUTION]
> Tuân thủ nghiêm ngặt **Mục 8.4** và tiêu chí **B-07, B-11** của đề thi, các hạng mục sau nằm **NGOÀI PHẠM VI** và **CẤM THAY ĐỔI**:
> 1. **Không thêm chương trình Toán hoặc nội dung SGK mới:** Không tự tạo thêm bài học ngoài 81 bài SGK đã có trong `data/seed.json` và `data/curriculum.json`; chỉ xây dựng câu hỏi ước lượng dựa trên các bài phép nhân/chia sẵn có.
> 2. **Không thay đổi Authentication / Authorization (`B-07`):** Không sửa `server/auth.js`, cơ chế session/cookie/Bearer token, không sửa các route `/api/auth/*`, `/api/teacher/*`, `/api/admin/*`.
> 3. **Không sửa tài khoản mẫu & cấu hình Deployment (`B-07`):** Giữ nguyên các tài khoản `hocsinh01`..`hocsinh99`, `giaovien01` và các file `Dockerfile`, `.dockerignore`, `DEPLOY.md`.
> 4. **Không kết nối ứng dụng thật / production & Không dùng dữ liệu cá nhân thật (`B-11`):** Chỉ sử dụng SQLite cục bộ và các tài khoản/nhân vật synthetic hư cấu; không lưu PII hay secret trong mã nguồn.
> 5. **Không dùng LLM để sinh đáp án hoặc chấm điểm lúc chạy (runtime):** Mọi phép kiểm tra đúng/sai đều là biểu thức toán học tất định trong code.
> 6. **Không bắt buộc deploy public & Không thay đổi 4 `type` câu hỏi cũ:** Giữ nguyên hành vi của `multiple-choice`, `input`, `compare`, `paint`, các mini-game và bảng xếp hạng.

---

## 3. Quy tắc Nghiệp vụ Toán học Tất định & Chấm điểm: `min`, `max` và `exact` (B-03, B-06)

### 3.1. Mô hình câu hỏi 2 bước & Định dạng Mã hóa Đáp án Chuẩn hóa Duy nhất
Mỗi câu hỏi `type = 'estimate'` đưa ra một phép nhân $A \times B$ hoặc phép chia $A : B$ thuộc chương trình lớp 3. Học sinh thực hiện tuần tự **2 bước**:
- **Bước 1 — Ước lượng (`estimate` = $u$):** Học sinh nhẩm nhanh xem tích hoặc thương khoảng bao nhiêu (dựa trên quy tắc làm tròn đến hàng chục) và nhập số nguyên $u$ **trước khi** tính chi tiết.
- **Bước 2 — Tính đúng (`exact` = $v$):** Học sinh tính chính xác kết quả của phép nhân/chia và nhập số nguyên $v$.

> [!IMPORTANT]
> **Định dạng Mã hóa Đáp án Chuẩn hóa (Single Source of Truth):**
> Trong cơ sở dữ liệu (`data/seed.json` và bảng `questions`), cột `correct_answer` lưu trữ **DUY NHẤT một chuỗi JSON chuẩn hóa** gồm 4 trường số nguyên tất định:
> ```json
> {
>   "min": 110,
>   "max": 120,
>   "canonical": 120,
>   "exact": 114
> }
> ```
> - `min` (Integer): Cận dưới của khoảng ước lượng hợp lý ($min \le exact \le max$).
> - `max` (Integer): Cận trên của khoảng ước lượng hợp lý.
> - `canonical` (Integer): Giá trị ước lượng chuẩn sư phạm (kết quả sau khi làm tròn đến hàng chục).
> - `exact` (Integer): Đáp số tính toán chính xác tuyệt đối của phép tính.
>
> *(Không sử dụng chuỗi phân cách dạng cũ như "75-85|81" hay các tên biến khác nhau như min_estimate, exact_answer).*

### 3.2. Công thức xác định tất định bộ tham số `(min, max, canonical, exact)`

Mỗi câu hỏi trong cơ sở dữ liệu được xác định bằng một công thức toán học tất định duy nhất, không dùng hàm ngẫu nhiên hay từ "hoặc":

1. **Hàm làm tròn chuẩn đến hàng chục ($\text{round}_{10}$):**
   $$\text{round}_{10}(n) = \left\lfloor \frac{n + 5}{10} \right\rfloor \times 10$$
   *(Chữ số hàng đơn vị từ $0..4$ làm tròn xuống chục dưới; từ $5..9$ làm tròn lên chục trên).*

2. **Ba loại bài toán Ước lượng Nhân / Chia trong bộ đề:**

| Loại bài toán (Trên các bài nhân/chia đã có) | Công thức Kết quả đúng (`exact`) | Công thức Ước lượng chuẩn (`canonical`) | Công thức Khoảng hợp lý `[min, max]` duy nhất | Ví dụ minh họa cụ thể |
| :--- | :---: | :---: | :---: | :--- |
| **Loại 1: Ước lượng tích trong Bảng nhân 6, 7, 8, 9**<br/>*(Bài 9, 11, 13, 14: $a \times b$)* | $P = a \times b$ | $E_{\text{std}} = \text{round}_{10}(P)$ | Kẹp giữa hai mốc tròn chục liên tiếp chứa $P$:<br/>• $min = \lfloor P / 10 \rfloor \times 10$<br/>• $max = \lceil P / 10 \rceil \times 10$ | **$6 \times 7 = ?$**<br/>• `exact` = $42$<br/>• `canonical` = $\text{round}_{10}(42) = 40$<br/>• `[min, max]` = **`[40, 50]`** |
| **Loại 2: Nhân số có 2 chữ số với số có 1 chữ số**<br/>*(Làm tròn thừa số đến hàng chục — Bài 23: $A \times b$)* | $P = A \times b$ | $E_{\text{std}} = \text{round}_{10}(A) \times b$ | Bao phủ từ mốc chục của $P$ đến tích làm tròn $E_{\text{std}}$:<br/>• $min = \min(\lfloor P/10 \rfloor \times 10,\; E_{\text{std}})$<br/>• $max = \max(\lceil P/10 \rceil \times 10,\; E_{\text{std}})$ | **$19 \times 6 = ?$**<br/>• Làm tròn $19 \approx 20 \Rightarrow E_{\text{std}} = 20 \times 6 = 120$<br/>• `exact` = $114$<br/>• `[min, max]` = **`[110, 120]`** |
| **Loại 3: Ước lượng thương trong Phép chia cho 6, 7, 8, 9**<br/>*(Bài 10, 12, 13, 14, 26: $A : b$)* | $Q = A : b$ | $E_{\text{std}} = \text{round}\left(\frac{\text{round}_{10}(A)}{b}\right)$ | Khoảng thương lân cận với dung sai cố định $\pm 2$ đơn vị:<br/>• $min = \max(1,\; Q - 2)$<br/>• $max = Q + 2$ | **$78 : 6 = ?$**<br/>• `exact` = $13$<br/>• Làm tròn $78 \approx 80 \Rightarrow E_{\text{std}} = 13$<br/>• `[min, max]` = **`[11, 15]`** |

---

### 3.3. Cơ chế Ép thứ tự "Ước lượng trước" & Xử lý Câu hỏi Bảo vệ

1. **Cơ chế Ép thứ tự tại Giao diện (UI-Enforced Sequence):**
   - Học sinh khi mở bài tập bắt buộc thực hiện **Bước 1 trước**: Tiêu điểm (focus) nằm tại Ô 1 (Ước lượng).
   - Ô 2 (Tính đúng) bị tạm khóa (`disabled`). Chỉ khi học sinh nhập một số tự nhiên hợp lệ vào Ô 1 và bấm `Tab` / `Enter` (hoặc rời ô), Ô 2 mới được mở khóa để nhập kết quả tính chính xác.
   - Khi nộp bài, Client đóng gói toàn bộ cặp câu trả lời `{ estimate: u, exact: v }` gửi lên `POST /api/submissions` trong một lượt duy nhất.
2. **Xử lý tình huống học sinh nhập kết quả chính xác vào ô ước lượng ($u === exact$):**
   - *Về mặt điểm số:* Do $exact$ luôn nằm trong khoảng hợp lý $[min, max]$, hệ thống công nhận `estimateOk = true` (không phạt điểm học sinh tính nhẩm giỏi).
   - *Về mặt phản hồi sư phạm:* Nếu $u === exact$ nhưng $u \ne canonical$, hệ thống bổ sung ghi chú: *"Em đã tính ra luôn kết quả chính xác! Tuy nhiên ở bước ước lượng, em nên làm tròn số đến hàng chục (ví dụ: [canonical]) để rèn phản xạ nhẩm nhanh nhé!"*.

---

### 3.4. Ma trận 4 Trạng thái Tính điểm & Công thức `score_percent` (B-06)

Khi học sinh nộp cặp $(u, v)$, hệ thống xác thực:
- `estimateOk = isValidInt(u) && (u >= min && u <= max)`
- `exactOk = isValidInt(v) && (v === exact)`

| Trạng thái | `estimateOk` | `exactOk` | Điểm nhận được (`earnedPoints`) | Cờ `correct` | Tính vào `correct_count`? | Phản hồi sư phạm (`feedback` B-06) |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **ST-1** | `true` | `true` | **100% điểm câu** ($q.points$) | `true` | **+1** | *"Xuất sắc! Em ước lượng hợp lý (trong khoảng min–max) và tính đúng kết quả chính xác!"* |
| **ST-2** | `true` | `false` | **50% điểm câu** ($\text{round}(q.points \times 0.5)$) | `false` | **+0** | *"Em ước lượng khoảng rất tốt! Tuy nhiên kết quả tính chính xác còn nhầm, em kiểm tra lại bảng nhân/chia nhé."* |
| **ST-3** | `false` | `true` | **50% điểm câu** ($\text{round}(q.points \times 0.5)$) | `false` | **+0** | *"Em tính ra kết quả chính xác đúng rồi! Nhưng bước ước lượng ban đầu chưa sát khoảng hợp lý, em nhớ làm tròn số nhé."* |
| **ST-4** | `false` | `false` | **0% điểm câu** ($0$) | `false` | **+0** | *"Cả số ước lượng và kết quả tính đúng đều chưa chính xác. Em hãy làm tròn số để ước lượng khoảng trước rồi tính lại nhé!"* |

#### Công thức tổng hợp điểm:
- **Số câu hoàn thành trọn vẹn (`correct_count`):**
  $$\text{correct\_count} = \sum_{i=1}^{N} [\text{detail}[i].\text{correct} == \text{true}]$$
- **Điểm phần trăm (`score_percent`):**
  $$\text{score\_percent} = \text{round}\left( \frac{\sum_{i=1}^{N} \text{detail}[i].\text{earnedPoints}}{\sum_{i=1}^{N} q[i].\text{points}} \times 100 \right)$$

---

## 4. Đặc tả Use Cases & Sơ đồ Luồng hoạt động (Use Case & Activity Diagrams)

### 4.1. Sơ đồ Use Case — Tác nhân Học sinh (Lớp 3)

![Sơ đồ Use Case Học sinh](./docs/usecase-hoc-sinh.svg)

- **Các nhóm thao tác chính của Học sinh:**
  1. **Nhóm thao tác Truy cập bài tập Ước lượng:** Chọn bài học Ước lượng từ Mục lục SGK / Trang chủ (`B-01`), mở phiếu bài tập trên luồng học chính (`lesson.html` / `exercise.html`), tải danh sách câu hỏi an toàn ẩn đáp án đúng (`B-04`).
  2. **Nhóm thao tác Thực hiện Ước lượng & Tính đúng:** Xem đề bài & gợi ý làm tròn, nhập Bước 1 (Số Ước lượng) trước, nhập Bước 2 (Kết quả tính đúng) sau, hoặc làm mới (Reset) các ô nhập.
  3. **Nhóm thao tác Điều khiển bàn phím & Báo lỗi:** Di chuyển giữa các ô bằng `Tab` / `Shift+Tab`, nhấn `Enter` để nộp bài không cần chuột, nhận thông báo lỗi tiếng Việt dễ hiểu khi bỏ trống hoặc nhập sai định dạng (`B-12`).
  4. **Nhóm thao tác Nộp bài & Chấm điểm Server:** Gửi cặp `(estimate, exact)` lên `POST /api/submissions`, Server kiểm tra tất định khoảng `min <= estimate <= max` và `exact === đáp số đúng` (`B-03`).
  5. **Nhóm thao tác Nhận phản hồi (Feedback B-06):** Xem đánh giá riêng cho Bước 1 (*"Ước lượng hợp lý"* hay *"Chưa hợp lý"*) và Bước 2 (*"Kết quả chính xác"* Đúng hay Sai), xem giải thích khoảng hợp lý `[min, max]` sau khi nộp.
  6. **Nhóm thao tác Lưu điểm & Đồng bộ Tiến độ:** Lưu lịch sử lượt làm (`attempts`) và kỷ lục điểm cao nhất (`progress`), nhận sao thưởng khi vượt kỷ lục cũ, tải lại trang (`F5`) vẫn giữ nguyên điểm số và trạng thái mở khóa (`B-05`).

---

### 4.2. Sơ đồ Use Case — Tác nhân Giáo viên (Chủ nhiệm)

![Sơ đồ Use Case Giáo viên](./docs/usecase-giao-vien.svg)

- **Các nhóm thao tác của Giáo viên (Kế thừa trên hệ thống):**
  1. **Nhóm thao tác Quản lý câu hỏi Ước lượng:** Xem danh sách bộ đề & câu hỏi dạng `estimate`, thêm/sửa/xóa (CRUD) câu hỏi Ước lượng, cấu hình điểm số và chủ đề.
  2. **Nhóm thao tác Giao phiếu bài tập Ước lượng:** Chọn bộ câu hỏi Ước lượng để giao cho lớp học (`3A2`), thiết lập hạn nộp bài (`due date`) và ghi chú hướng dẫn làm tròn.
  3. **Nhóm thao tác Theo dõi & Phân tích kết quả:** Xem số lượng học sinh đã hoàn thành bài tập Ước lượng, xem thống kê tỷ lệ làm sai ở dạng bài *"Ước lượng trước khi tính đúng"*, xem tiến độ & điểm cao nhất trung bình của lớp.
  4. **Nhóm thao tác Báo cáo & Tổng hợp điểm:** Tra cứu điểm trung bình & tổng sao của từng học sinh, xuất file báo cáo lớp (`CSV / Excel`) bao gồm kết quả làm bài Ước lượng.

---

### 4.3. Sơ đồ Activity — Luồng hoạt động của Học sinh (Swimlane 2 cột)

![Sơ đồ Activity Học sinh](./docs/activity-hoc-sinh.svg)

---

### 4.4. Sơ đồ Activity — Luồng hoạt động của Giáo viên (Swimlane 2 cột)

![Sơ đồ Activity Giáo viên](./docs/activity-giao-vien.svg)

---

## 5. Danh mục 12 Câu hỏi Synthetic trên các Phép Nhân / Chia đã có (B-02, Mục 8.2 & 8.4)

Toàn bộ 12 câu hỏi mẫu dưới đây được xây dựng trên **các phép nhân và phép chia thuộc các bài học đã có sẵn trong `data/seed.json`** (Bảng nhân/chia 6, 7, 8, 9 từ `bai-9` đến `bai-14` và Nhân/chia số có 2 chữ số với số có 1 chữ số ở `bai-23`, `bai-26`), tuân thủ tuyệt đối yêu cầu **không thêm nội dung SGK mới ngoài phạm vi (Mục 8.4)**:

| STT | Mã câu (`id`) | Gắn với bài học đã có | Đề bài (`prompt`) | Quy tắc ước lượng | Ước lượng chuẩn (`canonical`) | Khoảng hợp lý `[min, max]` | Kết quả đúng (`exact`) | Điểm |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | `est-1` | `bai-9` (Bảng nhân 6) | Ước lượng vào khoảng chục gần nhất rồi tính: **6 × 7 = ?** | Khoảng chục chứa tích | `40` | **`[40, 50]`** | **42** | 5 |
| 2 | `est-2` | `bai-9` (Bảng nhân 6) | Ước lượng vào khoảng chục gần nhất rồi tính: **6 × 8 = ?** | Khoảng chục chứa tích | `50` | **`[40, 50]`** | **48** | 5 |
| 3 | `est-3` | `bai-11` (Bảng nhân 7) | Ước lượng vào khoảng chục gần nhất rồi tính: **7 × 8 = ?** | Khoảng chục chứa tích | `60` | **`[50, 60]`** | **56** | 5 |
| 4 | `est-4` | `bai-14` (Bảng nhân 9) | Ước lượng vào khoảng chục gần nhất rồi tính: **9 × 7 = ?** | Khoảng chục chứa tích | `60` | **`[60, 70]`** | **63** | 5 |
| 5 | `est-5` | `bai-23` (Nhân 2 chữ số) | Làm tròn thừa số thứ nhất đến hàng chục để ước lượng rồi tính: **19 × 6 = ?** | $20 \times 6 = 120$ | `120` | **`[110, 120]`** | **114** | 10 |
| 6 | `est-6` | `bai-23` (Nhân 2 chữ số) | Làm tròn thừa số thứ nhất đến hàng chục để ước lượng rồi tính: **21 × 6 = ?** | $20 \times 6 = 120$ | `120` | **`[120, 130]`** | **126** | 10 |
| 7 | `est-7` | `bai-23` (Nhân 2 chữ số) | Làm tròn thừa số thứ nhất đến hàng chục để ước lượng rồi tính: **29 × 7 = ?** | $30 \times 7 = 210$ | `210` | **`[200, 210]`** | **203** | 10 |
| 8 | `est-8` | `bai-23` (Nhân 2 chữ số) | Làm tròn thừa số thứ nhất đến hàng chục để ước lượng rồi tính: **31 × 8 = ?** | $30 \times 8 = 240$ | `240` | **`[240, 250]`** | **248** | 10 |
| 9 | `est-9` | `bai-10` / `bai-26` (Chia cho 6) | Ước lượng thương rồi tính chính xác: **78 : 6 = ?** | $78 \approx 80$, thương gần $13$ ($\pm 2$) | `13` | **`[11, 15]`** | **13** | 10 |
| 10 | `est-10` | `bai-12` / `bai-26` (Chia cho 7) | Ước lượng thương rồi tính chính xác: **98 : 7 = ?** | $98 \approx 100$, thương gần $14$ ($\pm 2$) | `14` | **`[12, 16]`** | **14** | 10 |
| 11 | `est-11` | `bai-13` (Nhân với 8) | Mỗi hộp có **8** chiếc bút màu. Hỏi **18** hộp như thế có khoảng bao nhiêu chiếc (làm tròn 18 đến hàng chục) và chính xác bao nhiêu chiếc? | $20 \times 8 = 160$ | `160` | **`[140, 160]`** | **144** | 10 |
| 12 | `est-12` | `bai-14` / `bai-26` (Chia cho 9) | Có **99** bông hoa cắm đều vào **9** lọ. Hãy ước lượng xem mỗi lọ có khoảng mấy bông hoa rồi tính kết quả chính xác. | $99 \approx 90$, thương gần $11$ ($\pm 2$) | `11` | **`[9, 13]`** | **11** | 10 |

---

## 6. Bảng Tiêu chí Nghiệm thu Bắt buộc (Acceptance Criteria — Mục 8.3: B-01 đến B-12)

| ID | Tiêu chí bắt buộc của đề thi | Điều kiện nghiệm thu chi tiết (Given / When / Then) |
| :---: | :--- | :--- |
| **B-01** | Dạng bài mới truy cập được từ luồng học hiện có, không phải trang demo rời | **Given** học sinh đăng nhập vào hệ thống,<br/>**When** mở Trang chủ, Mục lục SGK (`muc-luc.html`) hoặc trang Luyện tập (`exercise.html` / `lesson.html`),<br/>**Then** truy cập và làm được ngay bài tập *"Ước lượng kết quả trước khi tính đúng"* thuộc bài học nhân/chia mà không cần gõ URL demo tách rời. |
| **B-02** | Có tối thiểu 12 fixture/câu hỏi synthetic tái lập được | **Given** chạy lệnh `npm run reset-db && npm start` từ dữ liệu mồi `data/seed.json`,<br/>**When** truy vấn cơ sở dữ liệu SQLite,<br/>**Then** có tối thiểu 12 câu hỏi thuộc `type = 'estimate'` về phép nhân/chia với đầy đủ tham số `min`, `max`, `exact`. |
| **B-03** | Quy tắc tạo và chấm ước lượng được mô tả rõ, tất định và test được | **Given** một câu hỏi ước lượng có bộ tham số `(min, max, exact)` và câu trả lời của học sinh `(u, v)`,<br/>**When** gọi hàm chấm điểm trên Server nhiều lần liên tiếp,<br/>**Then** kết quả trả về luôn cố định 100% theo công thức $min \le u \le max$ và $v = exact$, không sử dụng hàm ngẫu nhiên hay gọi LLM runtime. |
| **B-04** | API không trả đáp án đúng trước khi nộp | **Given** trình duyệt gọi `GET /api/question-sets/:setId/questions`,<br/>**When** kiểm tra payload JSON phản hồi từ Server,<br/>**Then** không có bất kỳ trường nào chứa `correct_answer`, `correctAnswer`, `min`, `max`, hay `exact`. |
| **B-05** | Server chấm và lưu kết quả; refresh không làm mất trạng thái đã lưu | **Given** học sinh nộp bài qua `POST /api/submissions`,<br/>**When** Server chấm điểm xong và học sinh nhấn `F5` (Refresh) hoặc gọi `GET /api/me/progress`,<br/>**Then** lịch sử lượt làm (`attempts`), điểm cao nhất (`progress.best_score`), trạng thái hoàn thành (`completed`) và tổng sao (`users.total_stars`) được bảo toàn trong SQLite. |
| **B-06** | Có feedback phân biệt "ước lượng hợp lý" với "kết quả chính xác" | **Given** học sinh nộp bài với 1 trong 4 tổ hợp (Đúng cả 2 / Ước lượng đúng - Tính đúng sai / Ước lượng sai - Tính đúng đúng / Sai cả 2),<br/>**When** nhận phản hồi từ `POST /api/submissions`,<br/>**Then** mỗi câu hỏi trả về `estimateOk`, `exactOk` và thông điệp `feedback` riêng biệt, hiển thị rõ ràng trạng thái từng bước trên giao diện. |
| **B-07** | Không sửa `server/auth.js`, session, tài khoản mẫu hoặc deployment | **Given** đối chiếu `git diff` với commit gốc đã pin của starter repo,<br/>**When** kiểm tra `server/auth.js`, các route `/api/auth/*`, `/api/teacher/*`, `/api/admin/*`, danh sách tài khoản mẫu và `Dockerfile`/`DEPLOY.md`,<br/>**Then** các thành phần này không bị thay đổi. |
| **B-08** | Có test tự động cho `normal`, `boundary`, `invalid input` và `scoring` | **Given** bộ kiểm thử tự động của dự án (đặc tả chi tiết trong `TEST_PLAN.md`),<br/>**When** thực thi kiểm thử,<br/>**Then** kiểm tra đầy đủ 4 nhóm: đầu vào chuẩn (`normal`), các giá trị biên `min`/`max`/`min-1`/`max+1` (`boundary`), dữ liệu lỗi (`invalid input`), và tính điểm/sao/hồi quy (`scoring`). |
| **B-09** | Bổ sung lệnh `npm test`; test đạt từ clean checkout | **Given** một bản sao mã nguồn vừa clone sạch,<br/>**When** chạy `npm ci` và `npm test`,<br/>**Then** toàn bộ các bài kiểm thử tự động chạy và đạt `PASS` (exit code `0`). |
| **B-10** | Bổ sung CI chạy `npm ci` và `npm test` trên Pull Request | **Given** file cấu hình `.github/workflows/ci.yml` trong repository,<br/>**When** tạo hoặc cập nhật Pull Request trên GitHub,<br/>**Then** GitHub Actions tự động thực thi `npm ci` và `npm test` thành công. |
| **B-11** | Không có PII/secret; chỉ dùng alias/tài khoản synthetic | **Given** toàn bộ mã nguồn, dữ liệu câu hỏi và lịch sử commit,<br/>**When** rà soát bảo mật và quyền riêng tư,<br/>**Then** chỉ chứa các tài khoản/nhân vật giả lập (`hocsinh01`..`99`, `giaovien01`), không chứa thông tin cá nhân thật hay khóa bí mật. |
| **B-12** | Giao diện dùng được bằng bàn phím cho luồng chính và có thông báo lỗi dễ hiểu | **Given** học sinh thao tác trên trang làm bài chỉ bằng bàn phím,<br/>**When** nhấn `Tab`/`Shift+Tab` để nhập Bước 1 (Ước lượng) $\rightarrow$ Bước 2 (Tính đúng) và nhấn `Enter` để nộp bài,<br/>**Then** luồng hoạt động đầy đủ; nếu bỏ trống hoặc nhập sai kiểu số thì hiển thị thông báo lỗi tiếng Việt thân thiện, dễ hiểu. |

---
*Các quyết định thiết kế kỹ thuật chi tiết được trình bày tại tài liệu [`DECISIONS.md`](./DECISIONS.md) và kế hoạch kiểm thử chi tiết được trình bày tại [`TEST_PLAN.md`](./TEST_PLAN.md).*
