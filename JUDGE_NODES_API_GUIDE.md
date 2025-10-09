# 🚀 Judge Nodes API Guide

## 📋 Tổng quan

Module `judge-nodes` quản lý các Judge0 nodes trong hệ thống chấm bài tự động. Mỗi node có thể chấm nhiều bài cùng lúc với giới hạn tải nhất định.

**Lưu ý**: Module này sử dụng **Sequelize (SQL)** thay vì MongoDB, tương tự như module `problems`.

## 🏗️ Cấu trúc Database

```sql
CREATE TABLE judge_nodes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  ip_address VARCHAR(100) NOT NULL,
  api_url VARCHAR(255) NOT NULL,                  -- Ví dụ: http://judge0-node1:2358
  status VARCHAR(20) DEFAULT 'online',            -- online | offline | maintenance
  current_load INT DEFAULT 0,                     -- Số bài đang chấm
  max_capacity INT DEFAULT 10,                    -- Giới hạn chấm song song
  last_heartbeat TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 API Endpoints

### **1. Quản lý Judge Nodes (CRUD)**

#### **GET /judge-nodes** - Lấy danh sách tất cả nodes
```bash
curl -X GET "http://localhost:3000/judge-nodes" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **GET /judge-nodes/:id** - Lấy node theo ID
```bash
curl -X GET "http://localhost:3000/judge-nodes/64f1234567890abcdef12345" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **POST /judge-nodes** - Tạo node mới (ADMIN only)
```bash
curl -X POST "http://localhost:3000/judge-nodes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Judge0-Node-1",
    "ip_address": "192.168.1.100",
    "api_url": "http://judge0-node1:2358",
    "status": "online",
    "max_capacity": 10
  }'
```

#### **PUT /judge-nodes/:id** - Cập nhật node (ADMIN only)
```bash
curl -X PUT "http://localhost:3000/judge-nodes/64f1234567890abcdef12345" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "maintenance",
    "max_capacity": 15
  }'
```

#### **DELETE /judge-nodes/:id** - Xóa node (ADMIN only)
```bash
curl -X DELETE "http://localhost:3000/judge-nodes/64f1234567890abcdef12345" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Quản lý Node Status**

#### **GET /judge-nodes/available** - Lấy nodes có sẵn để chấm bài
```bash
curl -X GET "http://localhost:3000/judge-nodes/available" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "data": [
    {
      "_id": "64f1234567890abcdef12345",
      "name": "Judge0-Node-1",
      "ip_address": "192.168.1.100",
      "api_url": "http://judge0-node1:2358",
      "status": "online",
      "current_load": 3,
      "max_capacity": 10,
      "last_heartbeat": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

#### **GET /judge-nodes/best** - Lấy node phù hợp nhất
```bash
curl -X GET "http://localhost:3000/judge-nodes/best" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **PUT /judge-nodes/:nodeId/status** - Cập nhật trạng thái node
```bash
curl -X PUT "http://localhost:3000/judge-nodes/64f1234567890abcdef12345/status" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "online",
    "current_load": 5
  }'
```

### **3. Heartbeat & Load Management**

#### **POST /judge-nodes/:nodeId/heartbeat** - Cập nhật heartbeat
```bash
curl -X POST "http://localhost:3000/judge-nodes/64f1234567890abcdef12345/heartbeat" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **POST /judge-nodes/:nodeId/load/increment** - Tăng tải node
```bash
curl -X POST "http://localhost:3000/judge-nodes/64f1234567890abcdef12345/load/increment" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **POST /judge-nodes/:nodeId/load/decrement** - Giảm tải node
```bash
curl -X POST "http://localhost:3000/judge-nodes/64f1234567890abcdef12345/load/decrement" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **4. Health Check & Monitoring**

#### **GET /judge-nodes/:nodeId/online-status** - Kiểm tra trạng thái online
```bash
curl -X GET "http://localhost:3000/judge-nodes/64f1234567890abcdef12345/online-status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "isOnline": true,
  "lastHeartbeat": "2024-01-15T10:30:00.000Z",
  "status": "online",
  "currentLoad": 3,
  "maxCapacity": 10
}
```

#### **POST /judge-nodes/health-check** - Kiểm tra và cập nhật nodes offline
```bash
curl -X POST "http://localhost:3000/judge-nodes/health-check" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Trạng thái Nodes

### **JudgeNodeStatus Enum:**
- `online`: Node đang hoạt động bình thường
- `offline`: Node không hoạt động
- `maintenance`: Node đang bảo trì

### **Load Management:**
- `current_load`: Số bài đang chấm hiện tại
- `max_capacity`: Giới hạn tối đa bài có thể chấm song song
- Node chỉ nhận bài mới khi `current_load < max_capacity`

## 🔧 Sử dụng trong Code

### **Service Methods:**

```typescript
import { JudgeNodesService } from '@module/judge-nodes';

// Lấy node có sẵn
const availableNodes = await judgeNodesService.getAvailableNodes();

// Chọn node tốt nhất
const bestNode = await judgeNodesService.selectBestNode();

// Cập nhật heartbeat
await judgeNodesService.updateHeartbeat(nodeId);

// Tăng/giảm tải
await judgeNodesService.incrementLoad(nodeId);
await judgeNodesService.decrementLoad(nodeId);

// Kiểm tra node online
const isOnline = await judgeNodesService.isNodeOnline(nodeId);
```

### **Repository Methods:**

```typescript
import { JudgeNodesRepository } from '@module/judge-nodes';

// Tìm nodes có sẵn
const availableNodes = await judgeNodesRepository.findAvailableNodes();

// Cập nhật trạng thái
await judgeNodesRepository.updateNodeStatus(nodeId, 'online', 5);

// Cập nhật heartbeat
await judgeNodesRepository.updateHeartbeat(nodeId);
```

## 🚦 Quyền truy cập

### **USER Role:**
- Xem danh sách nodes
- Xem nodes có sẵn
- Xem node tốt nhất
- Kiểm tra trạng thái online

### **ADMIN Role:**
- Tất cả quyền của USER
- Tạo/sửa/xóa nodes
- Cập nhật trạng thái nodes
- Quản lý tải nodes
- Health check

## 🔄 Workflow chấm bài

1. **Nhận bài nộp** → Chọn node tốt nhất
2. **Gán bài cho node** → Tăng tải node
3. **Node chấm bài** → Gửi heartbeat định kỳ
4. **Hoàn thành chấm** → Giảm tải node
5. **Health check** → Kiểm tra nodes offline

## 📝 Lưu ý quan trọng

1. **Heartbeat timeout**: Node được coi là offline nếu không có heartbeat trong 5 phút
2. **Load balancing**: Hệ thống tự động chọn node có tải thấp nhất
3. **Capacity check**: Node không nhận bài mới khi đạt max_capacity
4. **Error handling**: Tất cả API đều có xử lý lỗi và validation
5. **Authentication**: Tất cả API đều yêu cầu Bearer token

## 🎯 Ví dụ tích hợp với Judge0

```typescript
// 1. Chọn node tốt nhất
const node = await judgeNodesService.selectBestNode();
if (!node) {
  throw new Error('No available judge nodes');
}

// 2. Tăng tải node
await judgeNodesService.incrementLoad(node._id);

try {
  // 3. Gửi bài đến Judge0
  const response = await fetch(`${node.api_url}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      stdin: testCase.input
    })
  });

  const result = await response.json();
  
  // 4. Giảm tải node
  await judgeNodesService.decrementLoad(node._id);
  
  return result;
} catch (error) {
  // 5. Giảm tải node nếu có lỗi
  await judgeNodesService.decrementLoad(node._id);
  throw error;
}
```
