# 📊 Judge Node Logs API Guide

## 📋 Tổng quan

Module `judge-node-logs` quản lý logs của các Judge0 nodes trong hệ thống chấm bài tự động. Mỗi hoạt động của node đều được ghi lại để theo dõi và phân tích.

**Lưu ý**: Module này sử dụng **Sequelize (SQL)** tương tự như module `problems` và `judge-nodes`.

## 🏗️ Cấu trúc Database

```sql
CREATE TABLE judge_node_logs (
  log_id SERIAL PRIMARY KEY,
  judge_node_id INT NOT NULL REFERENCES judge_nodes(id),
  event_type VARCHAR(50),               -- heartbeat, submission_assigned, submission_completed, error
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📝 Các loại Event Types

### **LogEventType Enum:**
- `heartbeat`: Node gửi heartbeat
- `submission_assigned`: Bài được gán cho node
- `submission_completed`: Node hoàn thành chấm bài
- `error`: Node gặp lỗi
- `node_online`: Node chuyển sang trạng thái online
- `node_offline`: Node chuyển sang trạng thái offline
- `maintenance_start`: Bắt đầu bảo trì node
- `maintenance_end`: Kết thúc bảo trì node
- `load_changed`: Thay đổi tải của node
- `status_changed`: Thay đổi trạng thái node

## 🎯 API Endpoints

### **1. Quản lý Logs (CRUD)**

#### **GET /judge-node-logs** - Lấy danh sách tất cả logs
```bash
curl -X GET "http://localhost:3000/judge-node-logs" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **GET /judge-node-logs/:id** - Lấy log theo ID
```bash
curl -X GET "http://localhost:3000/judge-node-logs/64f1234567890abcdef12345" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **POST /judge-node-logs** - Tạo log mới (ADMIN only)
```bash
curl -X POST "http://localhost:3000/judge-node-logs" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "judge_node_id": "64f1234567890abcdef12345",
    "event_type": "heartbeat",
    "message": "Node heartbeat received"
  }'
```

#### **PUT /judge-node-logs/:id** - Cập nhật log (ADMIN only)
```bash
curl -X PUT "http://localhost:3000/judge-node-logs/64f1234567890abcdef12345" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Updated log message"
  }'
```

#### **DELETE /judge-node-logs/:id** - Xóa log (ADMIN only)
```bash
curl -X DELETE "http://localhost:3000/judge-node-logs/64f1234567890abcdef12345" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Truy vấn Logs theo điều kiện**

#### **GET /judge-node-logs/by-node/:nodeId** - Lấy logs theo node ID
```bash
curl -X GET "http://localhost:3000/judge-node-logs/by-node/64f1234567890abcdef12345?limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
[
  {
    "_id": "64f1234567890abcdef12345",
    "judge_node_id": "64f1234567890abcdef12345",
    "event_type": "heartbeat",
    "message": "Node heartbeat received",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### **GET /judge-node-logs/by-event-type/:eventType** - Lấy logs theo loại sự kiện
```bash
curl -X GET "http://localhost:3000/judge-node-logs/by-event-type/heartbeat?limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **GET /judge-node-logs/by-node-and-event/:nodeId/:eventType** - Lấy logs theo node và event type
```bash
curl -X GET "http://localhost:3000/judge-node-logs/by-node-and-event/64f1234567890abcdef12345/heartbeat?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **GET /judge-node-logs/recent** - Lấy logs gần đây nhất
```bash
curl -X GET "http://localhost:3000/judge-node-logs/recent?limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **3. Thống kê và Báo cáo**

#### **GET /judge-node-logs/node-activity/:nodeId** - Tóm tắt hoạt động của node
```bash
curl -X GET "http://localhost:3000/judge-node-logs/node-activity/64f1234567890abcdef12345" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "totalLogs": 1250,
  "eventTypeCounts": {
    "heartbeat": 800,
    "submission_assigned": 200,
    "submission_completed": 200,
    "error": 50
  },
  "lastActivity": "2024-01-15T10:30:00.000Z"
}
```

#### **GET /judge-node-logs/daily-stats** - Thống kê logs theo ngày
```bash
curl -X GET "http://localhost:3000/judge-node-logs/daily-stats?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
[
  {
    "date": "2024-01-15",
    "totalLogs": 450,
    "eventTypeCounts": {
      "heartbeat": 300,
      "submission_assigned": 75,
      "submission_completed": 75
    }
  }
]
```

### **4. Tạo Logs tự động**

#### **POST /judge-node-logs/create-log** - Tạo log mới (ADMIN only)
```bash
curl -X POST "http://localhost:3000/judge-node-logs/create-log" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "64f1234567890abcdef12345",
    "eventType": "submission_assigned",
    "message": "Submission 12345 assigned to node"
  }'
```

#### **POST /judge-node-logs/log-heartbeat** - Log heartbeat (ADMIN only)
```bash
curl -X POST "http://localhost:3000/judge-node-logs/log-heartbeat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "64f1234567890abcdef12345"
  }'
```

#### **POST /judge-node-logs/log-error** - Log lỗi (ADMIN only)
```bash
curl -X POST "http://localhost:3000/judge-node-logs/log-error" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nodeId": "64f1234567890abcdef12345",
    "errorMessage": "Connection timeout to Judge0 API"
  }'
```

## 🔧 Sử dụng trong Code

### **Service Methods:**

```typescript
import { JudgeNodeLogsService } from '@module/judge-node-logs';

// Lấy logs theo node
const nodeLogs = await judgeNodeLogsService.getLogsByNodeId(nodeId, 100);

// Lấy logs theo event type
const errorLogs = await judgeNodeLogsService.getLogsByEventType(LogEventType.ERROR, 50);

// Tạo log mới
await judgeNodeLogsService.createLog(user, nodeId, LogEventType.SUBMISSION_ASSIGNED, "Submission 12345 assigned");

// Log heartbeat
await judgeNodeLogsService.logHeartbeat(user, nodeId);

// Log lỗi
await judgeNodeLogsService.logError(user, nodeId, "Connection failed");

// Lấy thống kê hoạt động
const activity = await judgeNodeLogsService.getNodeActivitySummary(nodeId);

// Lấy thống kê theo ngày
const dailyStats = await judgeNodeLogsService.getDailyLogStats(7);
```

### **Repository Methods:**

```typescript
import { JudgeNodeLogsRepository } from '@module/judge-node-logs';

// Tìm logs theo node
const logs = await judgeNodeLogsRepository.findByNodeId(nodeId, 100);

// Tìm logs theo event type
const logs = await judgeNodeLogsRepository.findByEventType(LogEventType.ERROR, 50);

// Lấy thống kê hoạt động
const summary = await judgeNodeLogsRepository.getNodeActivitySummary(nodeId);
```

## 🚦 Quyền truy cập

### **USER Role:**
- Xem danh sách logs
- Xem logs theo node ID
- Xem logs theo event type
- Xem logs gần đây
- Xem tóm tắt hoạt động node
- Xem thống kê theo ngày

### **ADMIN Role:**
- Tất cả quyền của USER
- Tạo/sửa/xóa logs
- Tạo logs tự động
- Log heartbeat
- Log lỗi

## 📊 Workflow Logging

### **1. Node Startup:**
```typescript
// Khi node khởi động
await judgeNodeLogsService.logNodeOnline(user, nodeId);
```

### **2. Heartbeat:**
```typescript
// Mỗi khi node gửi heartbeat
await judgeNodeLogsService.logHeartbeat(user, nodeId);
```

### **3. Assignment:**
```typescript
// Khi gán bài cho node
await judgeNodeLogsService.logSubmissionAssigned(user, nodeId, submissionId);
```

### **4. Completion:**
```typescript
// Khi node hoàn thành chấm bài
await judgeNodeLogsService.logSubmissionCompleted(user, nodeId, submissionId, result);
```

### **5. Error Handling:**
```typescript
// Khi node gặp lỗi
await judgeNodeLogsService.logError(user, nodeId, errorMessage);
```

### **6. Status Changes:**
```typescript
// Khi thay đổi trạng thái node
await judgeNodeLogsService.logStatusChanged(user, nodeId, "online", "offline");
```

## 📈 Monitoring & Analytics

### **1. Node Health Monitoring:**
```typescript
// Kiểm tra hoạt động gần đây của node
const activity = await judgeNodeLogsService.getNodeActivitySummary(nodeId);
if (activity.lastActivity < new Date(Date.now() - 5 * 60 * 1000)) {
  console.log('Node may be offline');
}
```

### **2. Error Rate Analysis:**
```typescript
// Phân tích tỷ lệ lỗi
const errorLogs = await judgeNodeLogsService.getLogsByEventType(LogEventType.ERROR, 1000);
const totalLogs = await judgeNodeLogsService.getRecentLogs(1000);
const errorRate = errorLogs.length / totalLogs.length;
```

### **3. Performance Tracking:**
```typescript
// Theo dõi hiệu suất theo ngày
const dailyStats = await judgeNodeLogsService.getDailyLogStats(30);
dailyStats.forEach(day => {
  console.log(`${day.date}: ${day.totalLogs} logs, ${day.eventTypeCounts.submission_completed} completed`);
});
```

## 🎯 Ví dụ tích hợp với Judge Nodes

```typescript
// Khi node nhận bài chấm
const node = await judgeNodesService.selectBestNode();
if (node) {
  // Log việc gán bài
  await judgeNodeLogsService.logSubmissionAssigned(user, node._id, submissionId);
  
  // Tăng tải node
  await judgeNodesService.incrementLoad(node._id);
  
  try {
    // Gửi bài đến Judge0
    const result = await submitToJudge0(node, submission);
    
    // Log hoàn thành
    await judgeNodeLogsService.logSubmissionCompleted(user, node._id, submissionId, result.status);
    
    // Giảm tải node
    await judgeNodesService.decrementLoad(node._id);
    
    return result;
  } catch (error) {
    // Log lỗi
    await judgeNodeLogsService.logError(user, node._id, error.message);
    
    // Giảm tải node
    await judgeNodesService.decrementLoad(node._id);
    
    throw error;
  }
}
```

## 📝 Lưu ý quan trọng

1. **Performance**: Logs có thể tăng trưởng nhanh, cần có chiến lược cleanup
2. **Storage**: Cân nhắc lưu trữ logs cũ trong cold storage
3. **Indexing**: Đảm bảo có index trên `judge_node_id` và `event_type`
4. **Retention**: Thiết lập policy xóa logs cũ (ví dụ: 90 ngày)
5. **Monitoring**: Sử dụng logs để theo dõi health của Judge0 nodes

Module `judge-node-logs` đã sẵn sàng để tích hợp với hệ thống Judge System!
