import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import {
    IsString,
    IsOptional,
    IsEnum,
    IsNumber,
    IsDateString,
} from "class-validator";

export enum SubmissionStatus {
    PENDING = "pending",
    RUNNING = "running",
    ACCEPTED = "accepted",
    WRONG_ANSWER = "wrong_answer",
    TIME_LIMIT_EXCEEDED = "time_limit_exceeded",
    MEMORY_LIMIT_EXCEEDED = "memory_limit_exceeded",
    RUNTIME_ERROR = "runtime_error",
    COMPILE_ERROR = "compile_error",
    INTERNAL_ERROR = "internal_error",
    JUDGING = "judging",
    IN_QUEUE = "in_queue",
    PROCESSING = "processing",
    RUNTIME_ERROR_SIGSEGV = "runtime_error_sigsegv",
    RUNTIME_ERROR_SIGXFSZ = "runtime_error_sigxfsz",
    RUNTIME_ERROR_SIGFPE = "runtime_error_sigfpe",
    RUNTIME_ERROR_SIGABRT = "runtime_error_sigabrt",
    RUNTIME_ERROR_NZEC = "runtime_error_nzec",
    RUNTIME_ERROR_OTHER = "runtime_error_other",
    EXEC_FORMAT_ERROR = "exec_format_error",
}

export enum ProgrammingLanguage {
    PYTHON = "python",
    JAVASCRIPT = "javascript",
    JAVA = "java",
    CPP = "cpp",
    C = "c",
    CSHARP = "csharp",
    GO = "go",
    RUST = "rust",
    PHP = "php",
    RUBY = "ruby",
    SWIFT = "swift",
    KOTLIN = "kotlin",
    TYPESCRIPT = "typescript",
}

export class StudentSubmissions implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID của submission (tự sinh hoặc custom)
     * @example "sub_64f1234567890abcdef12345"
     */
    @IsString()
    @EntityDefinition.field({ label: "Submission ID", required: true })
    submission_id: string;

    /**
     * ID của sinh viên nộp bài
     * @example "user_64f1234567890abcdef12345"
     */
    @IsString()
    @EntityDefinition.field({ label: "Student ID", required: true })
    student_id: string;

    /**
     * ID của bài tập
     * @example "prob_64f1234567890abcdef12345"
     */
    @IsString()
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    /**
     * ID của lớp học (NULL nếu bài public)
     * @example "class_64f1234567890abcdef12345"
     */
    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Class ID" })
    class_id?: string;

    /**
     * ID của Judge0 node được gán để chấm
     * @example "node_64f1234567890abcdef12345"
     */
    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Judge Node ID" })
    judge_node_id?: string;

    /**
     * Mã nguồn của sinh viên
     * @example "print('Hello World')"
     */
    @IsString()
    @EntityDefinition.field({ label: "Source Code", required: true })
    code: string;

    /**
     * Ngôn ngữ lập trình
     */
    @IsEnum(ProgrammingLanguage)
    @EntityDefinition.field({
        label: "Programming Language",
        enum: Object.values(ProgrammingLanguage),
        example: ProgrammingLanguage.PYTHON,
    })
    language: ProgrammingLanguage;

    /**
     * Trạng thái chấm bài
     */
    @IsEnum(SubmissionStatus)
    @EntityDefinition.field({
        label: "Submission Status",
        enum: Object.values(SubmissionStatus),
        example: SubmissionStatus.PENDING,
    })
    status: SubmissionStatus;

    /**
     * Điểm số (0.00 - 100.00)
     * @example 85.50
     */
    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Score", example: 0.0 })
    score?: number;

    /**
     * Thời gian thực thi (milliseconds)
     * @example 1500
     */
    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Execution Time (ms)", example: 0 })
    execution_time_ms?: number;

    /**
     * Bộ nhớ sử dụng (MB)
     * @example 128.50
     */
    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Memory Used (MB)", example: 0.0 })
    memory_used_mb?: number;

    /**
     * Số test case đã pass
     * @example 8
     */
    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Test Cases Passed", example: 0 })
    test_cases_passed?: number;

    /**
     * Tổng số test case
     * @example 10
     */
    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Total Test Cases", example: 0 })
    total_test_cases?: number;

    /**
     * Thông báo lỗi (nếu có)
     * @example "Compilation failed: syntax error"
     */
    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Error Message" })
    error_message?: string;

    /**
     * Token của Judge0 để query kết quả
     * @example "a1b2c3d4e5f6g7h8i9j0"
     */
    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Judge0 Token" })
    submission_token?: string;

    /**
     * Thời gian nộp bài
     * @example "2024-01-15T10:30:00.000Z"
     */
    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({
        label: "Submitted At",
        example: "2024-01-15T10:30:00.000Z",
    })
    submitted_at?: Date;

    /**
     * Thời gian hoàn thành chấm bài
     * @example "2024-01-15T10:35:00.000Z"
     */
    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({
        label: "Judged At",
        example: "2024-01-15T10:35:00.000Z",
    })
    judged_at?: Date;

    // Virtual relationships
    @EntityDefinition.field({
        label: "Student",
        disableImport: true,
        propertyTarget: "User",
    })
    student?: any;

    @EntityDefinition.field({
        label: "Problem",
        disableImport: true,
        propertyTarget: "Problems",
    })
    problem?: any;

    @EntityDefinition.field({
        label: "Class",
        disableImport: true,
        propertyTarget: "Classes",
    })
    class?: any;

    @EntityDefinition.field({
        label: "Judge Node",
        disableImport: true,
        propertyTarget: "JudgeNodes",
    })
    judge_node?: any;
}
