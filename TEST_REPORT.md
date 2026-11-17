---
title: "Báo cáo Kết quả Kiểm thử — Track B: Vườn Toán Lớp 3"
document_id: "KTPMUD-2026-TRACKB-TEST-REPORT"
version: "1.3.0-local-and-CI-evidence"
date: "2026-11-17"
track: "Track B — Vườn Toán Lớp 3 (hoang_mai_toan)"
group: "29"
repository: "https://github.com/TRuong-c/ktpmud-bkt-vuontoan-starter"
working_branch: "track-b-main"
status: "LOCAL_TEST_PASS_31_OF_31; CI_6_SUCCESS_VISIBLE; LOCAL_TEST_COMMIT_NOT_CAPTURED"
---

# BÁO CÁO KẾT QUẢ KIỂM THỬ (TEST_REPORT.md)

**Dự án:** Vườn Toán Lớp 3 — Thêm dạng bài *“Ước lượng kết quả trước khi tính đúng”*  
**Nhóm:** 29 · **Track:** B  
**Ngày kiểm thử local được chứng minh:** 15/11/2026  
**Ngày cập nhật trạng thái CI:** 17/11/2026

> [!IMPORTANT]
> **Phân biệt bằng chứng:** Nhóm đã cung cấp ảnh Terminal thể hiện lần chạy **31 tests, 31 pass, 0 fail, 0 skipped** trên máy local ngày 15/11/2026 (Node.js v22.23.4). Đây là kết quả *đã quan sát được*, không phải kết quả giả định. **Cập nhật 17/11:** ảnh GitHub Actions nhóm cung cấp hiển thị **6/6 CI workflow runs xanh** trên `track-b-main`, mới nhất tại commit `522bb7d` ngày 16/11. Chưa xem log từng job để xác nhận chi tiết bộ test chạy trong CI, cũng chưa chứng minh lần test local ngày 15/11 được thực hiện tại đúng SHA đó. Chưa suy diễn rằng ứng dụng đã được kiểm thử thủ công toàn diện hay rằng thành viên khác có thêm lượt test.
>
> Báo cáo này **thay thế các số liệu giả** từng xuất hiện ở bản Checkpoint 1 (như “14 Passed” và “CI xanh 100%”). Bản kế hoạch `TEST_PLAN.md` và bảng test từng ghi ở báo cáo draft không được xem là kết quả chạy thực tế.

---

## 1. Môi trường thực thi thử nghiệm

| Thông số | Ghi nhận từ bằng chứng ngày 15/11/2026 |
| :--- | :--- |
| Hệ điều hành/Terminal | Windows, PowerShell trong VS Code; phiên bản Windows cụ thể **chưa xác minh** |
| Node.js thực thi thành công | **v22.23.4** (đã hiển thị khi chạy `node -v`) |
| npm | Thực thi qua **`npm.cmd`**; phiên bản npm cụ thể **chưa xác minh** |
| Trình chạy test | Node.js built-in test runner: `node --test` |
| Ba file test trong script | `tests/estimate.rules.test.js`, `tests/estimate.api.test.js`, `tests/estimate.ui.test.js` |
| Database / dependency | SQLite qua `better-sqlite3`; quá trình test có log nạp `data/seed.json` |
| Thư mục dự án trên máy kiểm thử | `D:\Visualcode\BKT\ktpmud-bkt-vuontoan-starter` |
| Nhánh đang dùng trong VS Code | `track-b-main` trong các ảnh trước đó; **chưa có `git status`/SHA tại đúng lần test** |
| Commit SHA tương ứng với lượt test | **Chưa xác minh** — không dùng SHA PC-1 để thay thế |
| Ngày chạy | 15/11/2026, theo ảnh chụp do nhóm cung cấp |
| Tổng thời gian chạy bộ test | **6022.8436 ms** (khoảng 6,02 giây) |

**Lịch sử xử lý lỗi môi trường:** Một lần chạy trước trên Node.js **v24.21.0** bị lỗi ABI của native module `better-sqlite3` (`NODE_MODULE_VERSION 127` so với `137`, `ERR_DLOPEN_FAILED`), nên hai tập test API/UI không chạy thành công. Sau khi chuyển phiên PowerShell sang **Node.js v22.23.4** trong thư mục Node 22 được giải nén, sử dụng `npm.cmd` thay vì `npm.ps1` (do PowerShell Execution Policy), nhóm đã cài dependency và chạy lại thành công 31 test. Đây là lỗi môi trường đã xử lý cho **lần chạy local được ghi nhận**, không kết luận mọi môi trường đã tương thích.

---

## 2. Lệnh thực thi kiểm thử

Các lệnh đã được ghi nhận qua ảnh Terminal:

```powershell
node -v
# v22.23.4

npm.cmd ci
npm.cmd test
```

Script `test` thực tế in ra Terminal:

```text
> vuon-toan-lop-3@1.0.0 test
> node --test tests/estimate.rules.test.js tests/estimate.api.test.js tests/estimate.ui.test.js
```

**Kết quả `npm.cmd ci`:** Cài thành công **173 packages**, audit **174 packages** trong khoảng **3 giây**. npm cảnh báo `prebuild-install@7.1.3` không còn được bảo trì và ghi nhận **2 vulnerabilities (1 moderate, 1 high)**. Chưa có bằng chứng phân tích chi tiết bằng `npm.cmd audit` hoặc khắc phục hai cảnh báo này.

**Dữ liệu kiểm thử:** Log có thông báo `[DB] Đã nạp dữ liệu mẫu từ data/seed.json`. Các cảnh báo `[Google Auth] GOOGLE_CLIENT_ID chưa được cấu hình` và `[Admin] ADMIN_SECRET chưa được cấu hình` xuất hiện trong môi trường test; bộ test tiếp tục chạy nhưng không chứng minh các chức năng Google OAuth/quản trị hoạt động với cấu hình triển khai đầy đủ.

---

## 3. Tổng hợp kết quả kiểm thử (Execution Summary)

### 3.1. Kết quả thực tế — local automated tests

| Chỉ số | Kết quả |
| :--- | ---: |
| **Tổng số bài kiểm thử Node thực thi** | **31** |
| **Passed** | **31** |
| **Failed** | **0** |
| Cancelled | 0 |
| Skipped | 0 |
| Todo | 0 |
| Suites (theo Node test runner) | 0 |
| **Duration** | **6022.8436 ms** |
| **Đánh giá lần chạy local này** | **PASS** |

### 3.2. Các phạm vi test có dấu ✓ trong ảnh Terminal

| Nhóm chức năng / tiêu chí liên quan | Các trường hợp có bằng chứng chạy thành công (tóm tắt từ ảnh) | Mức độ xác minh |
| :--- | :--- | :--- |
| **Tạo/chấm ước lượng (B-02, B-03, B-08)** | `computeParams` cho ba loại câu theo ADR-002; kiểm tra từ chối đầu vào sai; `TC-SEED` với **12 fixture**; normal/boundary (bao gồm cận và khoảng `110–120`); invalid dạng chuỗi/biểu thức; ma trận bốn trạng thái điểm; ví dụ nhân số hai chữ số và chia `78 : 6`; `parseAnswer` từ chối định dạng không hợp lệ. | Automated tests local: PASS |
| **API, quyền truy cập và bảo mật đáp án (B-01, B-04, B-05)** | `B-01`: dạng estimate có trong API lessons hiện có; `TC-SEC-01`: GET câu hỏi không lộ đáp án; HTTP 401 trước đăng nhập; 404 cho bộ không tồn tại; `TC-SUB-01/02/03`: chấm/lưu, giữ trạng thái và chống gửi trùng. | Automated tests local: PASS |
| **Điểm số và tương thích (B-05, B-06, B-07)** | `TC-SCORE-06`: `scorePercent`/`correctCount` trên bộ hỗn hợp; dữ liệu đầu vào sai được xử lý; `TC-REG-01`: câu hỏi cũ tiếp tục được chấm theo cơ chế cũ; `TC-AUD-01`: tài khoản mẫu/role; `B-07`: test kiểm tra không sửa các file bị cấm. | Automated tests local: PASS; không thay thế review diff toàn bộ |
| **Giao diện và điều hướng (B-01, B-12)** | Trang estimate có hai bước; hướng dẫn, liên kết điều hướng và thông báo lỗi; JavaScript nhắc lỗi khi chưa nhập đáp án; route theo vai trò; các trang quen thuộc HTTP vẫn hoạt động; đường dẫn `lesson.html?set=phieu-uoc-luong...` mở được theo bài kiểm thử. | Automated tests local: PASS; **chưa xác minh thao tác tay đầy đủ bằng bàn phím** |

**Quy tắc phân loại số lượng:** Báo cáo `TEST_REPORT.md` cũ là *kế hoạch* và có tổng chưa nhất quán (Unit 16 nhưng Normal 5 + Boundary 7 + Invalid 9 = 21; toàn bảng ghi 32). **31** ở đây là số test Node **thực sự chạy**, không tự động tương đương 31 test case ID trong `TEST_PLAN.md`. Không phân bổ tùy tiện 31 thành từng nhóm Unit/Integration/Regression nếu chưa đối chiếu toàn bộ tên test và file nguồn.

**Các lượt chạy khác:** Chưa có log, commit hoặc link CI đủ để xác nhận những lượt test riêng của các thành viên khác. Báo cáo không phủ nhận việc họ có thể đã test; chỉ không đưa lượt chưa có bằng chứng thành kết quả xác nhận.

---

## 4. Nhật ký thực thi từ Terminal (Raw Console Output)

**Trích chính xác phần tổng kết thể hiện trong ảnh Terminal gửi ngày 15/11/2026:**

```text
> vuon-toan-lop-3@1.0.0 test
> node --test tests/estimate.rules.test.js tests/estimate.api.test.js tests/estimate.ui.test.js

ℹ tests 31
ℹ suites 0
ℹ pass 31
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6022.8436
```

Đây là **trích xuất từ ảnh màn hình**, không phải toàn bộ stdout lưu tại file. Bằng chứng của lần chạy này đã được trưởng nhóm cung cấp trong hội thoại ngày 15/11/2026, bao gồm ảnh cài đặt `npm.cmd ci`, danh sách test ✓ và bảng tổng kết. **Chưa có liên kết bằng chứng GitHub công khai gắn với SHA xác định** trong các nguồn đã kiểm tra được.

Để tăng khả năng tái lập từ clean checkout, có thể lưu log của **lần chạy mới** cùng SHA tương ứng, sau khi kiểm tra không chứa secrets/PII. Không gán log mới cho thời điểm hoặc commit của lần chạy trước.

---

## 5. Kết quả GitHub Actions CI — cập nhật theo ảnh ngày 17/11/2026

| Nội dung | Tình trạng kiểm chứng |
| :--- | :--- |
| Workflow `CI` | **Đã thấy trong ảnh Actions.** |
| Số workflow runs hiển thị | **6** runs trên nhánh `track-b-main`. |
| Kết quả hiển thị | **6/6 có dấu xanh**, không có lượt đỏ trong danh sách ảnh. |
| Lượt mới nhất | Run #6, ngày 16/11/2026, khoảng 15:48 GMT+7, commit rút gọn `522bb7d`; ảnh hiển thị chạy thành công. |
| SHA commit của lượt mới nhất | `522bb7d2ba01057bae2721d7df00301870245688` theo `source-ref.json` mà nhóm đã nhập và ảnh nhánh; **chưa dùng SHA này để thay thế SHA tại thời điểm chạy test local ngày 15/11**. |
| URL CI | [Danh sách GitHub Actions của nhóm](https://github.com/TRuong-c/ktpmud-bkt-vuontoan-starter/actions); nhóm đã nhập một URL run cụ thể vào `source-ref.json`, nhưng ảnh cắt mất phần cuối nên **chưa đọc được ID run để trích chính xác ở tài liệu này**. |
| Log chi tiết các job | **Chưa xem được.** Không suy diễn workflow đã chạy đúng `npm ci && npm test` hoặc quét bảo mật chỉ từ biểu tượng xanh. |
| Check `validate` trong repository nộp bài | **Khác workflow CI của ứng dụng**, chưa có bằng chứng Draft PR/validate thành công tại thời điểm lập cập nhật này. |

**Đánh giá:** Có bằng chứng trực quan rõ ràng **GitHub Actions CI thành công 6 lượt** và kết quả test local 31/31 đạt; phần chưa chứng minh gồm nội dung log từng CI run, SHA tại đúng lần test local và kết quả `validate` của Draft PR. Cần không nhầm ba loại bằng chứng này.

---

## 6. Giới hạn, rủi ro và kết luận

### 6.1. Kết quả xác nhận được

- Nhóm đã chạy thành công **31/31 automated tests local**, 0 failed, bằng Node.js **v22.23.4**, sau khi cài dependency thành công.
- Bằng chứng hiển thị test rules/fixtures, API/SQLite, tính điểm, hồi quy và các route/giao diện.
- Lần chạy này thay thế phần “chưa chạy” trong báo cáo bản M1 và **không hợp thức hóa các số liệu giả trước đây**.

### 6.2. Rủi ro và những điều chưa được chứng minh

1. **Commit source của lần test:** Chưa ghi được SHA và `git status` tại thời điểm chạy, nên chưa thể khẳng định chính snapshot đã được đẩy lên fork GitHub. Đặc biệt không dùng commit SHA PC-1 cũ làm SHA kiểm thử ngày 15/11.
2. **Giới hạn bằng chứng CI:** Ảnh ngày 17/11 chứng minh sáu workflow runs hiển thị thành công, nhưng chưa có log từng run chứng minh đủ bước lệnh, ma trận hệ điều hành, kiểm tra dependency hay check `validate` ở repo bài nộp.
3. **An toàn dependency:** `npm.cmd ci` phát hiện 2 vulnerabilities (1 moderate, 1 high). Chưa có kết luận mức độ ảnh hưởng thực tế; cần phân tích qua `npm.cmd audit`, không tự chạy `npm audit fix --force`.
4. **Cấu hình OAuth/Admin:** Bộ test chạy khi các biến `GOOGLE_CLIENT_ID` và `ADMIN_SECRET` chưa cấu hình; không coi đây là kiểm thử đầy đủ cho đăng nhập Google hoặc luồng Admin thật.
5. **Kiểm thử thao tác tay và tính tiếp cận:** Cần demo end-to-end trên trình duyệt: từ bài học cũ → hai bước → server chấm → lưu DB → refresh giữ điểm; đồng thời thử bàn phím, thông báo lỗi và không lộ đáp án trước submit.
6. **Test bởi các thành viên khác:** Chưa có báo cáo/log/commit xác thực độc lập ở những tài liệu đang truy cập được. Kết quả đó có thể được bổ sung bằng chứng sau nếu nhóm đã thực hiện, nhưng không khai là đã xác minh.

### 6.3. Kết luận

**Đến ngày 17/11/2026, nhóm 29 đã cung cấp bằng chứng `LOCAL TEST: 31 PASS / 0 FAIL` trên Node.js 22.23.4 (lượt chạy 15/11) và ảnh `GITHUB ACTIONS: 6 RUNS XANH` trên `track-b-main` (mới nhất 16/11).** Đây là những kết quả thực tế phục vụ PC-2. Báo cáo **không khẳng định đã xem log của từng run, đã test thủ công đầy đủ, không còn lỗ hổng bảo mật, hay hoàn thành mọi tiêu chí B-01–B-12** khi chưa có bằng chứng.

**Tài liệu căn cứ:** `REQUIREMENTS.md`, `DECISIONS.md`, `TEST_PLAN.md` của nhóm; ảnh chạy test local được cung cấp ngày 15/11/2026; đề thi chính thức Hack Marathon 2026 (§6, §8.3); trang Progress Check v1.0.6. Nhận xét Checkpoint 1 để theo dõi tại [PR #1 của Track B](https://github.com/fossbk-spec/ktpmud-bkt-vuontoan-starter/pull/1). Bằng chứng CI được xác nhận từ ảnh Actions do nhóm cung cấp ngày 17/11; chưa đối chiếu được log chi tiết từng run. Vai trò thành viên không suy ra từ tác giả commit nếu chưa xác minh ánh xạ với MSSV.
