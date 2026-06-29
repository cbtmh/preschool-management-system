# Hệ Thống Quản Lý Trường Mầm Non

Dự án này là hệ thống quản lý trường mầm non toàn diện, bao gồm 3 thành phần chính:
1. **Backend**: Spring Boot (Java) cung cấp API.
2. **Frontend Web**: React + Vite (Dành cho quản trị viên/giáo viên).
3. **Mobile App**: React Native (Expo) (Dành cho phụ huynh và giáo viên).

---

## 🛠 Yêu cầu hệ thống (Prerequisites)

Để chạy dự án này trên máy tính của bạn (local), bạn cần cài đặt sẵn:
- **Java 17** (dành cho Backend)
- **Node.js 18+** (dành cho Web và Mobile)
- **PostgreSQL** (hoặc sử dụng **Docker** để chạy database nhanh chóng)
- Điện thoại có cài ứng dụng **Expo Go** (để chạy thử app Mobile)

---

## 🚀 Hướng dẫn cài đặt và chạy dự án

### 1. Cấu hình môi trường (.env)
Ở thư mục gốc của dự án, bạn sẽ thấy file `.env`. 
Bạn cần kiểm tra và sửa lại thông tin kết nối CSDL (Database) ở phần `[LOCAL]` cho khớp với PostgreSQL trên máy tính của bạn:
```properties
DB_URL=jdbc:postgresql://localhost:5454/preschool_db1
DB_USERNAME=postgres
DB_PASSWORD=123456
```
*(Các cấu hình dịch vụ bên thứ 3 như Cloudinary, Telegram, Twilio, Gmail đã có sẵn, bạn có thể dùng nguyên hoặc thay bằng key của bạn nếu cần).*

---

### 2. Chạy Backend (Spring Boot)

Mở Terminal (hoặc Command Prompt) và đi tới thư mục `preschool-management-backend`:
```bash
cd preschool-management-backend
```

**Bước 2.1: Chạy Database (Nếu bạn có dùng Docker)**
Trong thư mục backend có file `docker-compose.yml`, bạn có thể gõ lệnh sau để tạo nhanh CSDL:
```bash
docker-compose up -d
```
*(Nếu bạn cài PostgreSQL thủ công, hãy tự tạo một database tên là `preschool_db1` nhé).*

**Bước 2.2: Khởi động Backend**
- Trên Windows:
```bash
mvnw.cmd spring-boot:run
```
- Trên Mac/Linux:
```bash
./mvnw spring-boot:run
```
👉 Backend sẽ chạy ở địa chỉ: `http://localhost:8080`

---

### 3. Chạy Frontend Web

Mở một Terminal **mới** và đi tới thư mục `frontend`:
```bash
cd frontend
```

**Bước 3.1: Cài đặt thư viện**
```bash
npm install
```

**Bước 3.2: Khởi động Web**
```bash
npm run dev
```
👉 Giao diện Web sẽ chạy ở địa chỉ: `http://localhost:5173` (hoặc cổng mà Terminal hiển thị).

---

### 4. Chạy Mobile App

Mở một Terminal **mới** và đi tới thư mục `mobile`:
```bash
cd mobile
```

**Bước 4.1: Cài đặt thư viện**
```bash
npm install
```

**Bước 4.2: Khởi động Expo**
```bash
npm start
```
- Terminal sẽ hiển thị một **mã QR**.
- Bạn mở ứng dụng **Expo Go** trên điện thoại (đảm bảo điện thoại và máy tính đang bắt chung một mạng Wi-Fi), quét mã QR này để trải nghiệm ứng dụng.

---

## 📌 Tóm tắt thông tin các port mặc định
- **Backend API**: `http://localhost:8080`
- **Frontend Web**: `http://localhost:5173`
- **Database (PostgreSQL)**: Cổng `5454` (nếu chạy qua docker-compose) hoặc `5432` (mặc định của DB).
