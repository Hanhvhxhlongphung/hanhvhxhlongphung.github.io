# Firebase setup – Thư viện nghiệp vụ Long Phụng 4.0

## 1. Kiến trúc
- GitHub Pages: hosting giao diện tĩnh.
- Firebase Authentication: xác thực người dùng (phân quyền admin/editor/viewer).
- Cloud Firestore: metadata tài liệu, trạng thái công bố và hiệu lực pháp lý.
- Cloud Storage: tệp Word, Excel, PDF.
- Firebase Web SDK modular 13.1.0 qua CDN; không cần npm/build.

## 2. Tạo Firebase Project
1. Mở https://console.firebase.google.com/ và đăng nhập Google.
2. Chọn Add project, đặt tên dễ nhận biết, ví dụ `thu-vien-nghiep-vu-long-phung`.
3. Tắt Google Analytics nếu chưa cần; có thể bật sau.
4. Trong Project settings > General > Your apps, chọn biểu tượng Web (</>) và đăng ký ứng dụng.
5. Sao chép cấu hình web app vào `firebase-config.js`. Không đưa Service Account JSON/private key vào repository.

## 3. Bật Firestore
1. Vào Build > Firestore Database > Create database.
2. Chọn Production mode.
3. Chọn vị trí dữ liệu phù hợp. Cần cân nhắc kỹ vì vị trí database không thể đổi sau khi tạo; ưu tiên khu vực gần Việt Nam nếu có lựa chọn phù hợp.
4. Sau khi tạo, mở tab Rules và dán nội dung tệp `firestore.rules`, sau đó Publish.

## 4. Bật Authentication
1. Vào Build > Authentication > Get started.
2. Chọn Sign-in method > Email/Password > Enable > Save.
3. Chỉ tạo 03 tài khoản được phê duyệt. Không bật đăng ký công khai cho người lạ.
4. Trong Authentication > Settings > Authorized domains, bảo đảm có `hanhvhxhlongphung.github.io`.

## 5. Tạo hồ sơ người dùng và phân quyền
Sau khi tạo tài khoản đầu tiên trong Authentication:
1. Mở Authentication > Users, sao chép UID.
2. Mở Firestore > Data > Start collection (nếu chưa có) hoặc collection `users`.
3. Tạo document ID đúng bằng UID.
4. Tạo các trường:
   - `displayName` (string): tên hiển thị
   - `email` (string): email tài khoản
   - `role` (string): `admin`
   - `active` (boolean): `true`
5. Đây là tài khoản quản trị đầu tiên. Tạo hai tài khoản còn lại tương tự, gán `editor` và `viewer`.
6. Không cho người dùng tự sửa trường role. Chỉ chủ dự án/quản trị viên được cấp quyền qua Firebase Console.

## 6. Cloud Storage – LƯU Ý CHI PHÍ
Cloud Storage for Firebase hiện yêu cầu gói Blaze (trả theo mức dùng), kể cả khi có mức sử dụng miễn phí. Không nâng cấp billing nếu chưa được người có thẩm quyền chấp thuận và chưa thiết lập cảnh báo ngân sách.
- Nếu đã được duyệt: vào Build > Storage > Get started, tạo bucket, chọn vị trí và kiểm tra billing.
- Mở tab Rules, dán `storage.rules`, Publish.
- Nếu chưa được duyệt billing: tạm thời chưa tạo Storage bucket; tiếp tục giữ tệp ở thư mục GitHub hiện tại và chỉ triển khai Firestore trước.

## 7. Nhập dữ liệu văn bản/biểu mẫu
Collection: `documents`. Mỗi tài liệu là một document có ID duy nhất. Trường khuyến nghị:
- `name` (string), `category` (string), `type` (string: Văn bản/ Biểu mẫu)
- `description` (string), `status` (string: draft/published/archived)
- `legalStatus` (string: in_force/expired/amended/replaced/not_applicable)
- `issueNumber` (string), `issuedDate` (string YYYY-MM-DD)
- `effectiveDate` (string YYYY-MM-DD), `expiryDate` (string hoặc rỗng)
- `replacedBy` (string), `legalBasis` (string), `keywords` (array string)
- `fileName` (string), `storagePath` (string), `downloadURL` (string)
- `createdAt` (timestamp), `updatedAt` (timestamp), `createdBy` (string UID), `updatedBy` (string UID)

Chỉ bản ghi có `status = published` mới hiển thị công khai. `legalStatus` phải được người biên tập xác minh từ nguồn pháp luật chính thức; không tự suy đoán trạng thái hiệu lực.

Ví dụ document:
```json
{
  "name": "Tên văn bản hoặc biểu mẫu",
  "category": "Nội vụ",
  "type": "Văn bản",
  "description": "Trích yếu ngắn",
  "status": "draft",
  "legalStatus": "not_applicable",
  "issueNumber": "",
  "issuedDate": "",
  "effectiveDate": "",
  "expiryDate": "",
  "replacedBy": "",
  "legalBasis": "",
  "keywords": [],
  "fileName": "",
  "storagePath": "",
  "downloadURL": "",
  "createdAt": null,
  "updatedAt": null,
  "createdBy": "",
  "updatedBy": ""
}
```

Không nhập dữ liệu cá nhân nhạy cảm hoặc hồ sơ công dân lên kho tài liệu công khai.

## 8. Kết nối website
- `firebase-config.js`: thay các giá trị PASTE_* bằng cấu hình Web App thật.
- `firebase.js`: tự tải các document published từ Firestore.
- Nếu chưa cấu hình Firebase hoặc Firestore chưa có bản ghi, website vẫn giữ dữ liệu dự phòng trong `data.js`.
- Không xóa `data.js` và không xóa thư mục `tai-lieu/` trong giai đoạn chuyển đổi.

## 9. Kiểm thử trước khi dùng thật
- Truy cập website, mở DevTools Console.
- Khi cấu hình chưa hoàn tất, phải thấy thông báo dùng dữ liệu dự phòng, không làm trắng trang.
- Khi Firestore đã có bản ghi published, trang phải hiển thị dữ liệu Firestore.
- Tài khoản viewer không được ghi/xóa dữ liệu.
- Editor được tạo/cập nhật nhưng không được xóa.
- Admin được quản lý toàn bộ.
- Tệp không thuộc tài liệu published không được tải công khai.
- Kiểm thử Rules trong Firebase Rules Simulator trước khi đưa vào sử dụng.

## Tài liệu chính thức
- Firebase Web setup: https://firebase.google.com/docs/web/setup
- CDN alternative setup: https://firebase.google.com/docs/web/alt-setup
- Firestore Security Rules: https://firebase.google.com/docs/firestore/security/get-started
- Storage Security Rules: https://firebase.google.com/docs/storage/security
- Storage billing FAQ: https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024
