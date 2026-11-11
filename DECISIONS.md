---
title: "Hồ sơ Quyết định Kiến trúc (DECISIONS.md) — Track B: Vườn Toán Lớp 3"
document_id: "KTPMUD-2026-TRACKB-DECISIONS"
version: "2.0.0"
date: "2026-11-10"
track: "Track B — Brownfield Extension (ktpmud-bkt-vuontoan-starter)"
---

# HỒ SƠ QUYẾT ĐỊNH KIẾN TRÚC (DECISIONS.md / ADR)
**Dự án:** Vườn Toán Lớp 3 — Mở rộng dạng bài *"Ước lượng kết quả trước khi tính đúng"* (Track B)

> Tài liệu này ghi lại các Quyết định Kiến trúc (Architecture Decision Records — ADR) của nhóm khi thiết kế và mở rộng tính năng trên nền mã nguồn hiện có (`ktpmud-bkt-vuontoan-starter`), giải trình rõ các phương án đã cân nhắc, lý do lựa chọn, đánh đổi kỹ thuật (trade-offs) và trả lời trực tiếp các câu hỏi phản biện chuyên sâu từ Hội đồng/Giáo viên hướng dẫn.

---

## Mục lục các Quyết định Kiến trúc
- **[ADR-001]** Định dạng mã hóa chuẩn hóa duy nhất và cơ chế lưu trữ câu hỏi `estimate` trong SQLite (`server/db.js`, `data/seed.json`).
- **[ADR-002]** Thiết kế mô hình toán học tất định duy nhất để xác định khoảng `[min, max]` cho phép nhân và phép chia (`B-03`, Mục 8.2).
- **[ADR-003]** Hợp đồng API `POST /api/submissions`, Ma trận 4 trạng thái tính điểm, công thức `score_percent` và giải trình cơ chế "Ước lượng trước" (`B-04`, `B-05`, `B-06`).
- **[ADR-004]** Chiến lược tích hợp giao diện 2 bước vào luồng học hiện có, ép thứ tự sư phạm tại UI và điều hướng bàn phím (`B-01`, `B-12`).
- **[ADR-005]** Lựa chọn công cụ kiểm thử tự động (`node:test`) và cơ chế cô lập cơ sở dữ liệu qua `DB_PATH` (`B-08`, `B-09`, `B-10`).

---

## ADR-001: Định dạng mã hóa chuẩn hóa duy nhất và Lưu trữ câu hỏi `estimate` trong SQLite

- **Trạng thái:** Đã chấp thuận (Accepted) — Đã chuẩn hóa theo nhận xét Checkpoint 1
- **Ngày quyết định:** 2026-11-07 (Cập nhật chuẩn hóa: 2026-11-10)
- **Liên quan tới yêu cầu:** `B-02`, `B-04`, `B-07`

### 1. Bối cảnh (Context)
Trong mã nguồn hiện tại (`server/db.js`, dòng 46–57), bảng `questions` có cấu trúc cố định:
```sql
CREATE TABLE IF NOT EXISTS questions (
  id             TEXT PRIMARY KEY,
  set_id         TEXT NOT NULL,
  lesson_id      TEXT,
  type           TEXT NOT NULL,
  prompt         TEXT NOT NULL,
  options_json   TEXT,
  correct_answer TEXT NOT NULL,
  points         INTEGER NOT NULL DEFAULT 1,
  category       TEXT DEFAULT '',
  sort_order     INTEGER NOT NULL
);
```
Bốn loại câu hỏi cũ (`multiple-choice`, `input`, `compare`, `paint`) lưu một chuỗi đơn lẻ vào cột `correct_answer`. Dạng bài mới *"Ước lượng trước khi tính đúng"* cần lưu trữ đồng thời 4 thông số: cận dưới hợp lý (`min`), cận trên hợp lý (`max`), kết quả tính đúng (`exact`), và ước lượng chuẩn theo quy tắc làm tròn (`canonical`).

### 2. Quyết định Thống nhất Định dạng Mã hóa (Single Source of Truth)

> [!IMPORTANT]
> **Quyết định Chuẩn hóa Định dạng Đáp án (Khắc phục phản ánh của Thầy tại Checkpoint 1):**
> Nhóm **bãi bỏ hoàn toàn** các định dạng chuỗi phân cách cũ (như `"75-85|81"`) và các tên biến khác nhau (`min_estimate`, `exact_answer`).
> 
> Nhóm thống nhất **DUY NHẤT MỘT ĐỊNH DẠNG CHUẨN** là chuỗi JSON hợp lệ được lưu trong cột `correct_answer` với 4 trường số nguyên cố định:
> ```json
> {
>   "min": 110,
>   "max": 120,
>   "canonical": 120,
>   "exact": 114
> }
> ```

- **Ý nghĩa các trường:**
  - `min` (Integer): Cận dưới của khoảng ước lượng hợp lý ($min \le exact \le max$).
  - `max` (Integer): Cận trên của khoảng ước lượng hợp lý.
  - `canonical` (Integer): Giá trị ước lượng chuẩn sư phạm (kết quả sau khi làm tròn thừa số hoặc số bị chia đến hàng chục).
  - `exact` (Integer): Kết quả tính toán chính xác tuyệt đối của phép tính.

### 3. Đánh đổi kỹ thuật (Trade-offs & Rationale)
1. **Bảo mật mặc định (`B-04`):** Endpoint `GET /api/question-sets/:setId/questions` trong `server/api.js` (dòng 157–161) chỉ thực hiện:
   `SELECT id,type,prompt,options_json,points,category FROM questions...`
   Vì cột `correct_answer` không bao giờ được `SELECT`, nên toàn bộ thông số `min`, `max`, `canonical`, `exact` tự động được giấu kín 100% trước khi học sinh nộp bài mà không cần thêm code lọc dữ liệu.
2. **Không phá vỡ Schema CSDL (`B-07`):** Không chạy lệnh `ALTER TABLE`, không thêm cột mới, giữ nguyên 100% cấu trúc tương thích với toàn bộ các route admin/giáo viên hiện có.

---

## ADR-002: Mô hình toán học tất định duy nhất cho Ước lượng Phép Nhân / Chia

- **Trạng thái:** Đã chấp thuận (Accepted) — Đã chuẩn hóa theo nhận xét Checkpoint 1
- **Ngày quyết định:** 2026-11-09 (Cập nhật chuẩn hóa: 2026-11-10)
- **Liên quan tới yêu cầu:** `B-03`, `B-06`, Mục `8.2`, Mục `8.4`

### 1. Bối cảnh & Khắc phục nhận xét Checkpoint 1
Thầy nhận xét: *"Bản cũ ghi dung sai $\delta = 5 \times B$ (hoặc cận dưới/trên hàng chục của A). Chữ 'hoặc' nghĩa là có hai quy tắc. B-03 cần một công thức duy nhất cho mỗi loại câu."*
Đồng thời, phạm vi phép tính phải **hoàn toàn nằm trên các phép nhân/chia đã có** trong SGK lớp 3 (không dùng phép cộng/trừ 3 chữ số).

### 2. Quyết định: Công thức toán học tất định duy nhất cho từng loại câu

Toàn bộ câu hỏi `type = 'estimate'` được chia thành **3 loại câu cụ thể**, mỗi loại áp dụng **một công thức tất định duy nhất**:

1. **Hàm làm tròn chuẩn đến hàng chục ($\text{round}_{10}$):**
   $$\text{round}_{10}(n) = \left\lfloor \frac{n + 5}{10} \right\rfloor \times 10$$

2. **Công thức cho 3 loại bài toán:**

| Loại câu hỏi | Công thức `exact` | Công thức `canonical` | Công thức khoảng `[min, max]` duy nhất |
| :--- | :---: | :---: | :--- |
| **Loại 1: Phép nhân bảng 6, 7, 8, 9**<br/>*(Bài 9, 11, 13, 14: $a \times b$)* | $P = a \times b$ | $E = \text{round}_{10}(P)$ | Hai mốc chục liên tiếp kẹp quanh $P$:<br/>• $min = \lfloor P / 10 \rfloor \times 10$<br/>• $max = \lceil P / 10 \rceil \times 10$ |
| **Loại 2: Nhân số có 2 chữ số với số có 1 chữ số**<br/>*(Bài 23: $A \times b$, làm tròn $A$)* | $P = A \times b$ | $E = \text{round}_{10}(A) \times b$ | Bao phủ từ mốc chục của tích $P$ tới tích ước lượng $E$:<br/>• $min = \min(\lfloor P / 10 \rfloor \times 10,\; E)$<br/>• $max = \max(\lceil P / 10 \rceil \times 10,\; E)$ |
| **Loại 3: Phép chia cho 6, 7, 8, 9**<br/>*(Bài 10, 12, 13, 14, 26: $A : b$)* | $Q = A : b$ | $E = \text{round}\left(\frac{\text{round}_{10}(A)}{b}\right)$ | Đoạn lân cận thương đúng với dung sai cố định $\pm 2$ đơn vị:<br/>• $min = \max(1,\; Q - 2)$<br/>• $max = Q + 2$ |

> **Khẳng định tính tất định:** Không sử dụng từ "hoặc", không có tham số ngẫu nhiên. Mọi giá trị `(min, max, canonical, exact)` được tính trước bằng thuật toán cố định khi nạp dữ liệu mồi (`seed.json`) và kiểm chứng tự động bằng Unit Test.

---

## ADR-003: Cơ chế "Ước lượng trước", Ma trận 4 Trạng thái Tính điểm & Hợp đồng API

- **Trạng thái:** Đã chấp thuận (Accepted) — Bổ sung chi tiết theo nhận xét Checkpoint 1
- **Ngày quyết định:** 2026-11-10
- **Liên quan tới yêu cầu:** `B-03`, `B-05`, `B-06`, `B-08`

### 1. Phân tích & Giải trình Cơ chế "Ước lượng trước" (Chế độ Nộp & Ép thứ tự)

> [!NOTE]
> **Vấn đề đặt ra:** Học sinh gửi cả ước lượng và kết quả chính xác trong cùng 1 lần nộp `POST /api/submissions`. Làm sao đảm bảo học sinh "ước lượng trước khi tính đúng"? Ép thứ tự ở UI hay ở Server?

#### A. Quyết định: Ép thứ tự sư phạm tại UI, nộp nguyên khối tại Server
- **Tại sao không chia thành 2 request nộp ở Server:**
  - Nếu Server yêu cầu 2 endpoint (ví dụ: `POST /submissions/step-1` rồi `POST /submissions/step-2`), Server sẽ phải lưu trạng thái phiên làm việc dở dang (draft/session) vào DB, làm tăng tải, phát sinh rủi ro rò rỉ bộ nhớ, xử lý bài tập bị bỏ dở, và nguy cơ xung đột với middleware auth sẵn có (vi phạm `B-07`).
- **Giải pháp lựa chọn (Ép thứ tự tại UI):**
  - Giao diện bài tập (UI) kiểm soát chặt chẽ trạng thái tương tác của học sinh:
    - Khi tải trang câu hỏi, tiêu điểm (focus) bắt buộc đặt vào **Ô 1 (Bước 1: Ước lượng)**.
    - **Ô 2 (Bước 2: Kết quả tính đúng)** ban đầu ở trạng thái bị vô hiệu hóa (`disabled`) hoặc có lớp nhắc nhở: *"Em hãy hoàn thành ước lượng ở Bước 1 trước nhé"*.
    - Chỉ khi học sinh nhập số hợp lệ vào Ô 1 và bấm `Tab` / `Enter` (hoặc rời ô), Ô 2 mới được mở khóa (`enabled`) và focus tự động chuyển sang Ô 2.
  - Khi hoàn thành cả bài, Client gửi trọn vẹn payload chứa cặp `{ estimate: u, exact: v }` trong 1 request `POST /api/submissions` nguyên khối (atomic).

#### B. Trả lời Câu hỏi Bảo vệ: "Nếu học sinh nhập đúng kết quả chính xác vào ô ước lượng thì có được tính là hợp lý không?"
- **Phân tích:**
  - Về mặt toán học: Kết quả chính xác $exact$ luôn nằm trong khoảng hợp lý $[min, max]$. Nếu học sinh có khả năng nhẩm nhanh và điền đúng số $exact$ vào ô ước lượng, về mặt logic giá trị $min \le u \le max$ vẫn hoàn toàn thỏa mãn. Do đó, **thuật toán vẫn công nhận `estimateOk = true`** để bảo đảm tính công bằng, không phạt học sinh có năng lực tính nhẩm xuất sắc.
  - Về mặt sư phạm (`B-06 Feedback`): Hệ thống nhận diện trường hợp $u === exact$ nhưng $u \ne canonical$ để đưa ra câu nhận xét sư phạm tinh tế:
    *"Em đã tính ra ngay kết quả chính xác! Tuy nhiên ở bước Ước lượng, em hãy rèn luyện thói quen làm tròn số đến hàng chục (ví dụ: [canonical]) để tập nhẩm nhanh khoảng giá trị nhé!"*.

---

### 2. Ma trận 4 Trạng thái Tính điểm & Công thức `score_percent`

Để khắc phục thiếu sót *"chỉ có trạng thái đúng cả hai = 100%"* mà Thầy đã chỉ ra, nhóm quy định ma trận điểm chi tiết cho 4 trạng thái:

| Trạng thái | `estimateOk` | `exactOk` | Điểm nhận được (`earnedPoints`) | Cờ `correct` | Cộng vào `correct_count`? | Ý nghĩa sư phạm & Phản hồi (`B-06`) |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **ST-1** | `true` | `true` | **100% điểm câu** ($q.points$) | `true` | **+1** | **Xuất sắc:** Ước lượng chuẩn và tính toán chính xác tuyệt đối. |
| **ST-2** | `true` | `false` | **50% điểm câu** ($\text{round}(q.points \times 0.5)$) | `false` | **+0** | **Khích lệ:** Đạt kỹ năng ước lượng/làm tròn số, nhưng phép tính chi tiết bị nhầm. |
| **ST-3** | `false` | `true` | **50% điểm câu** ($\text{round}(q.points \times 0.5)$) | `false` | **+0** | **Nhắc nhở:** Tính đúng kết quả cuối cùng, nhưng bước ước lượng ban đầu bị lệch ngoài khoảng. |
| **ST-4** | `false` | `false` | **0% điểm câu** ($0$) | `false` | **+0** | **Chưa đạt:** Cả ước lượng và tính đúng đều chưa chính xác. |

#### Quy tắc tính `correct_count` và `score_percent` (Bảo toàn tương thích ngược):
1. **Số câu đúng (`correct_count`):**
   $$\text{correct\_count} = \sum_{i=1}^{N} [\text{detail}[i].\text{correct} == \text{true}]$$
   *Chỉ những câu đạt trạng thái ST-1 (đúng cả 2 bước) mới được tính là 1 câu đúng trọn vẹn, nhằm giữ nguyên tính nhất quán với cách hiển thị "10/12 câu đúng" của hệ thống cũ.*
2. **Tổng điểm đạt được (`earned_points`):**
   $$\text{total\_earned} = \sum_{i=1}^{N} \text{detail}[i].\text{earnedPoints}$$
3. **Tỷ lệ điểm phần trăm (`score_percent`):**
   $$\text{score\_percent} = \text{round}\left( \frac{\text{total\_earned}}{\sum_{i=1}^{N} q[i].\text{points}} \times 100 \right)$$
   *(Điểm số này được lưu vào bảng `attempts.score`, dùng để xét vượt kỷ lục `progress.best_score` và cộng sao thưởng `users.total_stars`).*

---

### 3. Hợp đồng Payload API `POST /api/submissions`

- **Client gửi lên (`answers`):**
  ```json
  {
    "setId": "phieu-uoc-luong-nhan-chia",
    "answers": {
      "est-1": { "estimate": "40", "exact": "42" },
      "est-2": { "estimate": "50", "exact": "48" }
    }
  }
  ```
- **Server phản hồi (`detail`):**
  ```json
  {
    "questionId": "est-1",
    "type": "estimate",
    "correct": true,
    "estimateOk": true,
    "exactOk": true,
    "earnedPoints": 10,
    "maxPoints": 10,
    "acceptableRange": { "min": 40, "max": 50, "canonical": 40 },
    "exactAnswer": 42,
    "feedback": "Xuất sắc! Em ước lượng hợp lý (40–50) và tính đúng kết quả chính xác (42)!"
  }
  ```

---

## ADR-004: Tích hợp Giao diện 2 bước & Khả năng tiếp cận Bàn phím

- **Trạng thái:** Đã chấp thuận (Accepted)
- **Ngày quyết định:** 2026-11-09 (Cập nhật 2026-11-10)
- **Liên quan tới yêu cầu:** `B-01`, `B-06`, `B-12`

### Quyết định Thiết kế UI/UX:
1. **Truy cập tự nhiên (`B-01`):** Bộ đề ước lượng được gắn vào bài học hiện có (`bai-9`, `bai-10`, `bai-23`), hiển thị đồng bộ trên `muc-luc.html`, `lesson.html` và `exercise.html`.
2. **Luồng bàn phím trực quan (`B-12`):**
   - Học sinh nhấn `Tab` để vào ô Bước 1 (Ước lượng).
   - Nhập xong số ước lượng, nhấn `Tab` hoặc `Enter`, hệ thống xác thực nhanh: nếu hợp lệ thì mở khóa Ô 2 và chuyển focus ngay sang Ô 2 (Tính đúng).
   - Nhấn `Enter` tại Ô 2 để nộp bài.
3. **Thông báo lỗi trợ năng (Accessibility):**
   - Vùng thông báo lỗi sử dụng `aria-live="polite"` và hiển thị tiếng Việt rõ ràng: *"Em cần nhập số tự nhiên hợp lệ vào ô Ước lượng trước nhé!"*.

---

## ADR-005: Lựa chọn Công cụ Kiểm thử (`node:test`) và Cô lập DB qua `DB_PATH`

- **Trạng thái:** Đã chấp thuận (Accepted)
- **Ngày quyết định:** 2026-11-09 (Cập nhật 2026-11-10)
- **Liên quan tới yêu cầu:** `B-08`, `B-09`, `B-10`

### Quyết định:
- Sử dụng runner tích hợp `node --test` của Node.js (không cài thêm Jest/Mocha để giữ `package.json` và `package-lock.json` sạch sẽ, chạy siêu nhanh trên CI).
- Sử dụng biến môi trường `DB_PATH` có sẵn trong `server/db.js` để cô lập hoàn toàn CSDL tạm thời khi chạy `npm test`, bảo đảm clean checkout đạt 100% không làm bẩn file DB chính.
