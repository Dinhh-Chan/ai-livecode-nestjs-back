-- Script để fix database lock
-- Chạy các lệnh này trong psql hoặc DBeaver

-- 1. Xem các connection đang chạy và queries đang chờ
SELECT 
    pid,
    usename,
    application_name,
    state,
    query,
    wait_event_type,
    wait_event
FROM pg_stat_activity
WHERE datname = 'aisoft'
ORDER BY state_change DESC;

-- 2. Xem các lock đang chờ
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- 3. Kill tất cả các connection (THẬN TRỌNG - chỉ dùng khi cần thiết)
-- Thay thế 'pid' bằng PID thực tế từ bước 1
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'aisoft' AND pid <> pg_backend_pid();

-- 4. Kill connection cụ thể (thay PID bằng PID thực tế)
-- SELECT pg_terminate_backend(PID_HERE);

-- 5. Hoặc kill tất cả connection trừ connection hiện tại
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'aisoft'
  AND pid <> pg_backend_pid()
  AND state = 'idle in transaction';

