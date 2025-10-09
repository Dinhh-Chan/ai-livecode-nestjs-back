# Hướng dẫn sử dụng Sort by ASC

## 1. API Get Problems by Sub Topic

### Endpoint
```
GET /problems/by-sub-topic/:subTopicId
```

### Các trường có thể sort:
- `name`: Tên bài tập
- `difficulty`: Độ khó (1-5)
- `created_at`: Ngày tạo
- `updated_at`: Ngày cập nhật
- `time_limit_ms`: Giới hạn thời gian
- `memory_limit_mb`: Giới hạn bộ nhớ

### Ví dụ Sort by ASC:

#### 1. Sắp xếp theo độ khó tăng dần (ASC)
```bash
curl -X GET "http://localhost:3000/problems/by-sub-topic/64f1234567890abcdef12345?sort=difficulty&order=asc"
```

#### 2. Sắp xếp theo tên bài tập A-Z (ASC)
```bash
curl -X GET "http://localhost:3000/problems/by-sub-topic/64f1234567890abcdef12345?sort=name&order=asc"
```

#### 3. Sắp xếp theo thời gian tạo (cũ nhất trước)
```bash
curl -X GET "http://localhost:3000/problems/by-sub-topic/64f1234567890abcdef12345?sort=created_at&order=asc"
```

#### 4. Sắp xếp theo giới hạn thời gian tăng dần
```bash
curl -X GET "http://localhost:3000/problems/by-sub-topic/64f1234567890abcdef12345?sort=time_limit_ms&order=asc"
```

#### 5. Kết hợp sort với filter
```bash
# Lấy problems dễ nhất, chỉ công khai
curl -X GET "http://localhost:3000/problems/by-sub-topic/64f1234567890abcdef12345?sort=difficulty&order=asc&is_public=true&limit=5"
```

### JavaScript/Fetch Examples:

```javascript
// Sắp xếp theo độ khó tăng dần
const response = await fetch('/problems/by-sub-topic/64f1234567890abcdef12345?sort=difficulty&order=asc');
const problems = await response.json();

// Sắp xếp theo tên A-Z
const sortedByName = await fetch('/problems/by-sub-topic/64f1234567890abcdef12345?sort=name&order=asc');
const nameSortedProblems = await sortedByName.json();

// Sắp xếp với giới hạn
const limitedResponse = await fetch('/problems/by-sub-topic/64f1234567890abcdef12345?sort=difficulty&order=asc&limit=10');
const limitedProblems = await limitedResponse.json();
```

---

## 2. API Get Test Cases by Problem

### Endpoint
```
GET /test-cases/by-problem/:problemId
```

### Các trường có thể sort:
- `order_index`: Thứ tự sắp xếp (quan trọng nhất)
- `created_at`: Ngày tạo
- `updated_at`: Ngày cập nhật
- `input_data`: Dữ liệu đầu vào
- `expected_output`: Kết quả mong đợi

### Ví dụ Sort by ASC:

#### 1. Sắp xếp theo thứ tự test case (ASC) - **Khuyến nghị**
```bash
curl -X GET "http://localhost:3000/test-cases/by-problem/64f1234567890abcdef12345?sort=order_index&order=asc"
```

#### 2. Sắp xếp theo thời gian tạo (cũ nhất trước)
```bash
curl -X GET "http://localhost:3000/test-cases/by-problem/64f1234567890abcdef12345?sort=created_at&order=asc"
```

#### 3. Lấy test cases công khai, sắp xếp theo thứ tự
```bash
curl -X GET "http://localhost:3000/test-cases/by-problem/64f1234567890abcdef12345?sort=order_index&order=asc&is_public=true"
```

#### 4. Giới hạn số lượng test cases
```bash
curl -X GET "http://localhost:3000/test-cases/by-problem/64f1234567890abcdef12345?sort=order_index&order=asc&limit=3"
```

### JavaScript/Fetch Examples:

```javascript
// Sắp xếp test cases theo thứ tự
const response = await fetch('/test-cases/by-problem/64f1234567890abcdef12345?sort=order_index&order=asc');
const testCases = await response.json();

// Lấy test cases công khai theo thứ tự
const publicResponse = await fetch('/test-cases/by-problem/64f1234567890abcdef12345?sort=order_index&order=asc&is_public=true');
const publicTestCases = await publicResponse.json();

// Lấy 5 test cases đầu tiên theo thứ tự
const limitedResponse = await fetch('/test-cases/by-problem/64f1234567890abcdef12345?sort=order_index&order=asc&limit=5');
const limitedTestCases = await limitedResponse.json();
```

---

## 📝 Lưu ý quan trọng:

### 1. **Mặc định ASC**
- Nếu không chỉ định `order`, hệ thống sẽ mặc định sắp xếp theo **ASC** (tăng dần)
- Để sắp xếp giảm dần, phải chỉ định `order=desc`

### 2. **Test Cases - Sử dụng order_index**
- Đối với test cases, nên sử dụng `sort=order_index&order=asc` để lấy test cases theo đúng thứ tự logic
- `order_index` được thiết kế để sắp xếp test cases theo trình tự hợp lý

### 3. **Problems - Sắp xếp theo difficulty**
- Đối với problems, thường sử dụng `sort=difficulty&order=asc` để lấy từ dễ đến khó
- Hoặc `sort=name&order=asc` để sắp xếp theo tên A-Z

### 4. **Kết hợp với Filter**
```bash
# Lấy problems dễ nhất, công khai, giới hạn 10
curl -X GET "http://localhost:3000/problems/by-sub-topic/64f1234567890abcdef12345?sort=difficulty&order=asc&is_public=true&limit=10"

# Lấy test cases công khai, theo thứ tự, giới hạn 5
curl -X GET "http://localhost:3000/test-cases/by-problem/64f1234567890abcdef12345?sort=order_index&order=asc&is_public=true&limit=5"
```

### 5. **Response Format**
Kết quả trả về sẽ được sắp xếp theo yêu cầu:
```json
{
  "data": [
    {
      "_id": "id1",
      "name": "Bài tập 1",
      "difficulty": 1,
      // ... các field khác
    },
    {
      "_id": "id2", 
      "name": "Bài tập 2",
      "difficulty": 2,
      // ... các field khác
    }
  ],
  "total": 2
}
```

