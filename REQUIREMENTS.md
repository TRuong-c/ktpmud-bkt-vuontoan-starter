---
title: "Đặc tả Yêu cầu Phần mềm (REQUIREMENTS.md) — Track B: Vườn Toán Lớp 3"
document_id: "KTPMUD-2026-TRACKB-REQUIREMENTS"
version: "2.2.0"
date: "2026-11-16"
track: "Track B — Vườn Toán Lớp 3 (hoang_mai_toan)"
repository: "ktpmud-bkt-vuontoan-starter"
---

# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (REQUIREMENTS.md)
**Chủ đề Track B:** Vườn Toán Lớp 3 — Thêm dạng luyện tập *"Ước lượng kết quả trước khi tính đúng"* trên các phép nhân/chia đã có.

---

## 1. Giới thiệu & Bối cảnh nghiệp vụ (Business Context)

### 1.1. Hiện trạng hệ thống (Baseline System)
Ứng dụng web **Vườn Toán Lớp 3 — Trường Tiểu học Hoàng Mai** cung cấp lộ trình 81 bài học (`data/seed.json`, `data/curriculum.json`). Bảng nhân/chia 6, 7, 8, 9 nằm ở các bài đầu; nhân số có hai chữ số với số có một chữ số ở Bài 23; **chia số có hai chữ số cho số có một chữ số ở Bài 26**. Câu ước lượng chia hai chữ số chỉ được giao khi học sinh đã đến Bài 26, không gắn vào bài học bảng chia trước đó.

Hệ thống hiện có chỉ hỗ trợ **4 loại câu hỏi (`type`)** với cơ chế chấm điểm **1 bước — so khớp chuỗi ký tự tuyệt đối** (`given === correct_answer`):
- `multiple-choice`: Chọn 1 đáp án trắc nghiệm (`A`, `B`, `C`, `D`).
- `input`: Điền kết quả số cố định (ví dụ: `"54 : 6 = ?"` $\rightarrow$ `"9"`).
- `compare`: Điền dấu so sánh (`">"`, `"<"`, `"="`).
- `paint`: Tô màu thẻ phép tính theo kết quả (`"green"`, `"yellow"`).

### 1.2. Nhu cầu mở rộng nghiệp vụ (Mục 8.2 Đề thi)
Khi học sinh lớp 3 thực hiện các phép nhân và phép chia (đặc biệt là bảng nhân/chia 6, 7, 8, 9 hoặc nhân/chia số có hai chữ số với số có một chữ số), học sinh thường mắc lỗi tính nhầm hàng chục hoặc quên nhớ mà không tự nhận ra kết quả vô lý.

Do đó, hệ thống cần bổ sung dạng luyện tập mới: **"Ước lượng kết quả trước khi tính đúng" (`type = 'estimate'`)** ngay trên các phép nhân/chia đã có:
1. **Bước 1 (Ước lượng trước):** Học sinh chọn một **dải ước lượng trên tia số** trước khi tính chính xác. Với phép nhân có thừa số hai chữ số, học sinh nhập thêm giá trị trước và sau khi làm tròn. Với phép chia hai chữ số cho một chữ số, học sinh so sánh hai tích mốc dễ nhẩm; không làm tròn số bị chia đến hàng chục rồi chia cho số không chia hết.
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
- **Bước 1 — Ước lượng:** Học sinh kéo một dải trên tia số, gửi hai đầu nguyên `estimateMin` và `estimateMax`. Phép nhân có thừa số hai chữ số còn yêu cầu `roundBefore` và `roundAfter`; phép chia hai chữ số cho một chữ số dùng hai tích mốc dễ nhẩm. Bước này phải hoàn tất **trước khi** nhập kết quả chính xác.
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
> - `min` (Integer): Cận dưới của vùng chứa các dải ước lượng được chấp nhận ($min \le exact \le max$).
> - `max` (Integer): Cận trên của vùng đó; vùng này có thể rộng hơn chính dải học sinh kéo.
> - `canonical` (Integer): Mốc ước lượng chuẩn sư phạm; phép nhân dùng kết quả làm tròn đến hàng chục, phép chia dùng thương tại tích mốc gần số bị chia hơn.
> - `exact` (Integer): Đáp số tính toán chính xác tuyệt đối của phép tính.
>
> *(Không sử dụng chuỗi phân cách dạng cũ như "75-85|81" hay các tên biến khác nhau như min_estimate, exact_answer).*

### 3.2. Công thức xác định tất định bộ tham số `(min, max, canonical, exact)`

Mỗi câu hỏi trong cơ sở dữ liệu được xác định bằng công thức toán học tất định, không dùng hàm ngẫu nhiên. Hai cách chọn dải hợp lý của phép chia được hợp nhất thành một vùng chấm duy nhất `[min, max]` theo công thức bên dưới.

1. **Hàm làm tròn chuẩn đến hàng chục ($\text{round}_{10}$):**
   $$\text{round}_{10}(n) = \left\lfloor \frac{n + 5}{10} \right\rfloor \times 10$$
   *(Chữ số hàng đơn vị từ $0..4$ làm tròn xuống chục dưới; từ $5..9$ làm tròn lên chục trên).*

2. **Ba loại bài toán Ước lượng Nhân / Chia trong bộ đề:**

| Loại bài toán (Trên các bài nhân/chia đã có) | Công thức Kết quả đúng (`exact`) | Công thức Ước lượng chuẩn (`canonical`) | Công thức Vùng chấm `[min, max]` duy nhất | Ví dụ minh họa cụ thể |
| :--- | :---: | :---: | :---: | :--- |
| **Loại 1: Ước lượng tích trong Bảng nhân 6, 7, 8, 9**<br/>*(Bài 9, 11, 13, 14: $a \times b$)* | $P = a \times b$ | $E_{\text{std}} = \text{round}_{10}(P)$ | Kẹp giữa hai mốc tròn chục liên tiếp chứa $P$:<br/>• $min = \lfloor P / 10 \rfloor \times 10$<br/>• $max = \lceil P / 10 \rceil \times 10$ | **$6 \times 7 = ?$**<br/>• `exact` = $42$<br/>• `canonical` = $\text{round}_{10}(42) = 40$<br/>• `[min, max]` = **`[40, 50]`** |
| **Loại 2: Nhân số có 2 chữ số với số có 1 chữ số**<br/>*(Làm tròn thừa số đến hàng chục — Bài 23: $A \times b$)* | $P = A \times b$ | $E_{\text{std}} = \text{round}_{10}(A) \times b$ | Bao phủ từ mốc chục của $P$ đến tích làm tròn $E_{\text{std}}$:<br/>• $min = \min(\lfloor P/10 \rfloor \times 10,\; E_{\text{std}})$<br/>• $max = \max(\lceil P/10 \rceil \times 10,\; E_{\text{std}})$ | **$19 \times 6 = ?$**<br/>• Làm tròn $19 \approx 20 \Rightarrow E_{\text{std}} = 20 \times 6 = 120$<br/>• `exact` = $114$<br/>• `[min, max]` = **`[110, 120]`** |
| **Loại 3: Chia số có hai chữ số cho 6, 7, 8 hoặc 9**<br/>*(Bài 26; chia hết, thương từ 10 trở lên)* | $Q=A:b$ | Mốc thương ước lượng gần hơn trong hai mốc cách nhau 5; xem quy tắc chi tiết bên dưới. | Một dải duy nhất rộng **3** đơn vị theo mốc gần hơn; `[min,max]` chính là hai đầu dải đó. | **$78:6=?$**: $6\times10=60$, $6\times15=90$; 78 gần 90 hơn. `canonical` = **15**, `exact` = **13**; chỉ chấp nhận **`[12,15]`**. |

#### Quy tắc chi tiết cho phép chia hai chữ số

1. **Đầu vào:** $10 \le A \le 99$, $b\in\{6,7,8,9\}$, $A\bmod b=0$, $Q=A/b\ge10$. Phép chia có dư, thương dưới 10 và số chia có hai chữ số không thuộc dạng này.
2. **Hai tích mốc:** Server đặt $L=5\lfloor Q/5\rfloor$, $U=L+5$ rồi tính $bL$ và $bU$. Học sinh không được xem $Q$; em tự so sánh số bị chia $A$ với các tích mốc. Nếu $A-bL\le bU-A$, chọn mốc dưới $L$ làm `canonical`; ngược lại chọn mốc trên $U$. Với phép chia hết, không có trường hợp hai khoảng cách bằng nhau giữa hai mốc cách 5.
3. **Dải theo mốc gần hơn:** Nếu chọn mốc dưới, đặt $min=L$, $max=L+3$; nếu chọn mốc trên, đặt $min=U-3$, $max=U$. Trường hợp $A=bL$ chọn mốc dưới. Dải luôn rộng **3** đơn vị và chứa thương nguyên $Q$.
4. **Một khoảng chuẩn:** `[min,max]` là chính dải duy nhất học sinh cần kéo, không hợp nhất với dải khác quanh thương đúng. Ví dụ $78:6$ chỉ nhận `[12,15]`; $66:6$ chỉ nhận `[10,13]`.

**Quy tắc chấm riêng cho phép chia:** `estimateOk` chỉ đúng khi `estimateMin`, `estimateMax` là số nguyên, `estimateMax - estimateMin = 3`, `estimateMin = min`, `estimateMax = max` và dải chứa $Q$. Với `78 : 6`, chỉ `[12,15]` được chấp nhận. Tia số có thể ghi các vạch số thông thường, nhưng **không đánh dấu mốc được chọn làm `canonical`**, vùng chấm, thương đúng hay dải gợi ý trước khi học sinh nộp bài.

**Giới hạn bài học:** Chỉ dùng quy tắc này từ **Bài 26**, sau khi học sinh đã học nhân số có hai chữ số với số có một chữ số ở Bài 23. Các phép chia trong bảng có thương dưới 10 vẫn thuộc bài luyện tính đúng, không ép vào dạng kéo dải ước lượng. Phép chia có dư và phép chia cho số có hai chữ số nằm ngoài phạm vi quy tắc này. Chỉ đổi quy tắc cho `type = 'estimate'`; bốn loại câu hỏi cũ giữ nguyên.

---

### 3.3. Cơ chế Ép thứ tự "Ước lượng trước" & Xử lý Câu hỏi Bảo vệ

1. **Cơ chế ép thứ tự tại giao diện (UI-Enforced Sequence):**
   - Với phép nhân có thừa số hai chữ số, học sinh nhập `roundBefore` và `roundAfter` trước khi kéo dải; với phép nhân bảng hoặc phép chia, học sinh bắt đầu ở tia số. Tia số chỉ có các vạch số và dải kéo, **không tô sẵn vùng đúng**; núm bắt đầu ở đầu trái, không đặt trước vào vị trí đáp án.
   - Ô kết quả chính xác ban đầu bị khóa (`disabled`). Sau khi học sinh nhập đúng định dạng các giá trị làm tròn (nếu có) và **tự di chuyển** núm để chọn dải, ô mới mở. Giao diện không kiểm tra dải có đúng vùng chấm hay không trước khi nộp.
   - Khi nộp bài, Client gửi `{ estimateMin, estimateMax, roundBefore?, roundAfter?, exact }` của từng câu trong một lần `POST /api/submissions`.
2. **Xử lý tình huống học sinh tính ra thương đúng trước khi kéo dải:**
   - Bước ước lượng không nhận một số đơn lẻ. Học sinh vẫn phải kéo dải đúng độ rộng; hệ thống chấm dải theo điều kiện ở Mục 3.2 và 3.4, không so sánh một ô `estimate` với đáp số chính xác.
   - Không hiện `canonical`, vùng `[min, max]`, thương đúng hoặc dải gợi ý trước khi nộp. Sau khi nộp, phản hồi có thể giải thích cách so sánh hai tích mốc và nêu dải đã chọn.

---

### 3.4. Ma trận 4 Trạng thái Tính điểm & Công thức `score_percent` (B-06)

Khi học sinh nộp dải $(s,t)$ và kết quả chính xác $v$, hệ thống xác thực trên Server:
- `intervalValid = isValidInt(s) && isValidInt(t) && t - s === width && min <= s && t <= max`, trong đó `width = 10` cho phép nhân, `width = 2` cho phép chia hai chữ số.
- Với phép chia: `estimateOk = intervalValid && s <= exact && exact <= t`.
- Với phép nhân bảng: `estimateOk = intervalValid`. Với phép nhân có thừa số hai chữ số, còn phải kiểm tra `roundBefore` đúng số ban đầu và `roundAfter` đúng số tròn chục gần nhất.
- `exactOk = isValidInt(v) && (v === exact)`. Điểm và `correct_count` vẫn theo ma trận 4 trạng thái dưới đây.

| Trạng thái | `estimateOk` | `exactOk` | Điểm nhận được (`earnedPoints`) | Cờ `correct` | Tính vào `correct_count`? | Phản hồi sư phạm (`feedback` B-06) |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **ST-1** | `true` | `true` | **100% điểm câu** ($q.points$) | `true` | **+1** | *"Xuất sắc! Em ước lượng hợp lý (trong khoảng min–max) và tính đúng kết quả chính xác!"* |
| **ST-2** | `true` | `false` | **50% điểm câu** ($\text{round}(q.points \times 0.5)$) | `false` | **+0** | *"Em ước lượng khoảng rất tốt! Tuy nhiên kết quả tính chính xác còn nhầm, em kiểm tra lại bảng nhân/chia nhé."* |
| **ST-3** | `false` | `true` | **50% điểm câu** ($\text{round}(q.points \times 0.5)$) | `false` | **+0** | *"Em tính đúng rồi! Hãy kiểm tra lại dải ước lượng: phép chia so sánh hai tích mốc, phép nhân dùng số làm tròn phù hợp."* |
| **ST-4** | `false` | `false` | **0% điểm câu** ($0$) | `false` | **+0** | *"Cả dải ước lượng và kết quả tính đúng đều chưa chính xác. Em thử chọn mốc dễ nhẩm rồi tính lại nhé!"* |

#### Công thức tổng hợp điểm:
- **Số câu hoàn thành trọn vẹn (`correct_count`):**
  $$\text{correct\_count} = \sum_{i=1}^{N} [\text{detail}[i].\text{correct} == \text{true}]$$
- **Điểm phần trăm (`score_percent`):**
  $$\text{score\_percent} = \text{round}\left( \frac{\sum_{i=1}^{N} \text{detail}[i].\text{earnedPoints}}{\sum_{i=1}^{N} q[i].\text{points}} \times 100 \right)$$

---

## 4. Đặc tả Use Cases & Sơ đồ Luồng hoạt động (Use Case & Activity Diagrams)

Các sơ đồ SVG đính kèm minh họa luồng tổng quát và cần được cập nhật theo thao tác kéo dải ở Mục 3.3 khi triển khai quy tắc mới. Nếu sơ đồ cũ còn hình ô nhập một số ước lượng, **Mục 3.2–3.4 là đặc tả áp dụng**.

### 4.1. Sơ đồ Use Case — Tác nhân Học sinh (Lớp 3)

![Sơ đồ Use Case Học sinh](./docs/usecase-hoc-sinh.svg)

- **Các nhóm thao tác chính của Học sinh:**
  1. **Nhóm thao tác Truy cập bài tập Ước lượng:** Chọn bài học Ước lượng từ Mục lục SGK / Trang chủ (`B-01`), mở phiếu bài tập trên luồng học chính (`lesson.html` / `exercise.html`), tải danh sách câu hỏi an toàn ẩn đáp án đúng (`B-04`).
  2. **Nhóm thao tác Thực hiện Ước lượng & Tính đúng:** Xem phép tính và hướng dẫn chung; với phép chia hai chữ số, so sánh hai tích mốc rồi tự kéo dải trên tia số; với phép nhân hai chữ số, nhập số trước/sau làm tròn rồi kéo dải. Sau đó mới nhập kết quả chính xác hoặc làm mới câu trả lời.
  3. **Nhóm thao tác Điều khiển bàn phím & Báo lỗi:** Di chuyển giữa các ô bằng `Tab` / `Shift+Tab`, nhấn `Enter` để nộp bài không cần chuột, nhận thông báo lỗi tiếng Việt dễ hiểu khi bỏ trống hoặc nhập sai định dạng (`B-12`).
  4. **Nhóm thao tác Nộp bài & Chấm điểm Server:** Gửi hai đầu dải `estimateMin`, `estimateMax`, kết quả `exact` và giá trị làm tròn nếu cần lên `POST /api/submissions`; Server kiểm tra độ rộng, vị trí dải, bước làm tròn và đáp số đúng (`B-03`).
  5. **Nhóm thao tác Nhận phản hồi (Feedback B-06):** Xem đánh giá riêng cho Bước 1 (*"Ước lượng hợp lý"* hay *"Chưa hợp lý"*) và Bước 2 (*"Kết quả chính xác"* Đúng hay Sai), xem giải thích khoảng hợp lý `[min, max]` sau khi nộp.
  6. **Nhóm thao tác Lưu điểm & Đồng bộ Tiến độ:** Lưu lịch sử lượt làm (`attempts`) và kỷ lục điểm cao nhất (`progress`), nhận sao thưởng khi vượt kỷ lục cũ, tải lại trang (`F5`) vẫn giữ nguyên điểm số và trạng thái mở khóa (`B-05`).

---

### 4.2. Sơ đồ Use Case — Tác nhân Giáo viên (Chủ nhiệm)

![Sơ đồ Use Case Giáo viên](./docs/usecase-giao-vien.svg)

- **Các nhóm thao tác của Giáo viên (Kế thừa trên hệ thống):**
  1. **Nhóm thao tác Quản lý câu hỏi Ước lượng:** Xem danh sách bộ đề & câu hỏi dạng `estimate`, thêm/sửa/xóa (CRUD) câu hỏi Ước lượng, cấu hình điểm số và chủ đề.
  2. **Nhóm thao tác Giao phiếu bài tập Ước lượng:** Chọn bộ câu hỏi Ước lượng để giao cho lớp học (`3A2`), thiết lập hạn nộp bài (`due date`) và ghi chú cách làm tròn đối với phép nhân hoặc cách so sánh tích mốc đối với phép chia.
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

Toàn bộ 12 câu hỏi mẫu sử dụng các bài học đã có trong `data/seed.json`. Các câu nhân theo bảng hoặc nhân hai chữ số giữ bài học tương ứng; **ba câu chia có số bị chia hai chữ số chỉ gắn với `bai-26`**, sau kiến thức nhân hai chữ số với một chữ số ở `bai-23`. Không thêm nội dung SGK mới ngoài phạm vi (Mục 8.4). Với phép chia, `[min, max]` là **dải chuẩn duy nhất rộng 3 đơn vị**.

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
| 9 | `est-9` | `bai-26` (Chia hai chữ số cho một chữ số) | Ước lượng thương rồi tính chính xác: **78 : 6 = ?** | $6\times10=60$, $6\times15=90$; $78$ gần $90$ hơn. Chỉ nhận dải `12–15`. | `15` | **`[12, 15]`** | **13** | 10 |
| 10 | `est-10` | `bai-26` (Chia hai chữ số cho một chữ số) | Ước lượng thương rồi tính chính xác: **98 : 7 = ?** | $7\times10=70$, $7\times15=105$; $98$ gần $105$ hơn. Dải `12–15`. | `15` | **`[12, 15]`** | **14** | 10 |
| 11 | `est-11` | `bai-13` (Nhân với 8) | Mỗi hộp có **8** chiếc bút màu. Hỏi **18** hộp như thế có khoảng bao nhiêu chiếc (làm tròn 18 đến hàng chục) và chính xác bao nhiêu chiếc? | $20 \times 8 = 160$ | `160` | **`[140, 160]`** | **144** | 10 |
| 12 | `est-12` | `bai-26` (Chia hai chữ số cho một chữ số) | Có **99** bông hoa cắm đều vào **9** lọ. Hãy ước lượng xem mỗi lọ có khoảng mấy bông hoa rồi tính kết quả chính xác. | $9\times10=90$, $9\times15=135$; $99$ gần $90$ hơn. Dải `10–13`. | `10` | **`[10, 13]`** | **11** | 10 |

---

## 6. Bảng Tiêu chí Nghiệm thu Bắt buộc (Acceptance Criteria — Mục 8.3: B-01 đến B-12)

| ID | Tiêu chí bắt buộc của đề thi | Điều kiện nghiệm thu chi tiết (Given / When / Then) |
| :---: | :--- | :--- |
| **B-01** | Dạng bài mới truy cập được từ luồng học hiện có, không phải trang demo rời | **Given** học sinh đăng nhập và đã đến bài học phù hợp,<br/>**When** mở Trang chủ, Mục lục SGK hoặc trang Luyện tập,<br/>**Then** truy cập được bài ước lượng trong luồng học; câu chia hai chữ số thuộc **Bài 26**, không xuất hiện như nội dung của bài bảng chia 6–9. |
| **B-02** | Có tối thiểu 12 fixture/câu hỏi synthetic tái lập được | **Given** chạy lệnh `npm run reset-db && npm start` từ dữ liệu mồi `data/seed.json`,<br/>**When** truy vấn cơ sở dữ liệu SQLite,<br/>**Then** có tối thiểu 12 câu hỏi thuộc `type = 'estimate'` về phép nhân/chia với đầy đủ tham số `min`, `max`, `exact`. |
| **B-03** | Quy tắc tạo và chấm ước lượng rõ, tất định và test được | **Given** câu hỏi có `(min, max, canonical, exact)` và học sinh chọn dải `(estimateMin, estimateMax)`,<br/>**When** Server chấm nhiều lần,<br/>**Then** kết quả luôn cố định theo độ rộng dải, vị trí trong vùng chấm, điều kiện chứa thương đúng đối với phép chia, bước làm tròn đối với phép nhân có thừa số hai chữ số và `exact` của bước tính đúng; không dùng ngẫu nhiên hoặc LLM. |
| **B-04** | API không trả đáp án đúng trước khi nộp | **Given** trình duyệt gọi `GET /api/question-sets/:setId/questions`,<br/>**When** kiểm tra payload JSON phản hồi từ Server,<br/>**Then** không có bất kỳ trường nào chứa `correct_answer`, `correctAnswer`, `min`, `max`, hay `exact`. |
| **B-05** | Server chấm và lưu kết quả; refresh không làm mất trạng thái đã lưu | **Given** học sinh nộp bài qua `POST /api/submissions`,<br/>**When** Server chấm điểm xong và học sinh nhấn `F5` (Refresh) hoặc gọi `GET /api/me/progress`,<br/>**Then** lịch sử lượt làm (`attempts`), điểm cao nhất (`progress.best_score`), trạng thái hoàn thành (`completed`) và tổng sao (`users.total_stars`) được bảo toàn trong SQLite. |
| **B-06** | Có feedback phân biệt "ước lượng hợp lý" với "kết quả chính xác" | **Given** học sinh nộp bài với 1 trong 4 tổ hợp (Đúng cả 2 / Ước lượng đúng - Tính đúng sai / Ước lượng sai - Tính đúng đúng / Sai cả 2),<br/>**When** nhận phản hồi từ `POST /api/submissions`,<br/>**Then** mỗi câu hỏi trả về `estimateOk`, `exactOk` và thông điệp `feedback` riêng biệt, hiển thị rõ ràng trạng thái từng bước trên giao diện. |
| **B-07** | Không sửa `server/auth.js`, session, tài khoản mẫu hoặc deployment | **Given** đối chiếu `git diff` với commit gốc đã pin của starter repo,<br/>**When** kiểm tra `server/auth.js`, các route `/api/auth/*`, `/api/teacher/*`, `/api/admin/*`, danh sách tài khoản mẫu và `Dockerfile`/`DEPLOY.md`,<br/>**Then** các thành phần này không bị thay đổi. |
| **B-08** | Có test tự động cho `normal`, `boundary`, `invalid input` và `scoring` | **Given** bộ kiểm thử tự động của dự án,<br/>**When** thực thi kiểm thử,<br/>**Then** kiểm tra dải duy nhất rộng 3 của phép chia theo mốc gần hơn, dải sai độ rộng hoặc lệch cận, số chia 6–9, chia có dư/ thương dưới 10, dữ liệu lỗi, tính điểm/sao và hồi quy các type cũ. |
| **B-09** | Bổ sung lệnh `npm test`; test đạt từ clean checkout | **Given** một bản sao mã nguồn vừa clone sạch,<br/>**When** chạy `npm ci` và `npm test`,<br/>**Then** toàn bộ các bài kiểm thử tự động chạy và đạt `PASS` (exit code `0`). |
| **B-10** | Bổ sung CI chạy `npm ci` và `npm test` trên Pull Request | **Given** file cấu hình `.github/workflows/ci.yml` trong repository,<br/>**When** tạo hoặc cập nhật Pull Request trên GitHub,<br/>**Then** GitHub Actions tự động thực thi `npm ci` và `npm test` thành công. |
| **B-11** | Không có PII/secret; chỉ dùng alias/tài khoản synthetic | **Given** toàn bộ mã nguồn, dữ liệu câu hỏi và lịch sử commit,<br/>**When** rà soát bảo mật và quyền riêng tư,<br/>**Then** chỉ chứa các tài khoản/nhân vật giả lập (`hocsinh01`..`99`, `giaovien01`), không chứa thông tin cá nhân thật hay khóa bí mật. |
| **B-12** | Giao diện dùng được bằng bàn phím và không lộ đáp án | **Given** học sinh thao tác chỉ bằng bàn phím,<br/>**When** dùng `Tab`/`Shift+Tab` và phím mũi tên để di chuyển dải rồi `Enter` để tiếp tục/nộp,<br/>**Then** luồng hai bước hoạt động đầy đủ; núm bắt đầu ở đầu trái, không tô trước vùng đúng, ô kết quả chỉ mở sau khi chọn dải, và lỗi được báo bằng tiếng Việt dễ hiểu. |

---
*Quy tắc phép chia một dải rộng 3 đơn vị ở Mục 3.2–3.4 là quy tắc hiện hành. Các mô tả cũ về dải rộng 2 đơn vị hoặc hai dải cùng được chấp nhận không còn áp dụng.*
