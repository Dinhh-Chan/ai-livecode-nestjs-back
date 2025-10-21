import { ApiProperty } from "@nestjs/swagger";
import {
    SubmissionStatus,
    ProgrammingLanguage,
} from "../entities/student-submissions.entity";

export class SubmissionResponseDto {
    @ApiProperty({ description: "ID của submission" })
    _id: string;

    @ApiProperty({ description: "ID submission" })
    submission_id: string;

    @ApiProperty({ description: "ID của sinh viên" })
    student_id: string;

    @ApiProperty({ description: "ID của bài tập" })
    problem_id: string;

    @ApiProperty({ description: "ID của lớp học", required: false })
    class_id?: string;

    @ApiProperty({ description: "Mã nguồn" })
    code: string;

    @ApiProperty({
        description: "Ngôn ngữ lập trình",
        enum: ProgrammingLanguage,
    })
    language: ProgrammingLanguage;

    @ApiProperty({
        description: "Trạng thái submission",
        enum: SubmissionStatus,
    })
    status: SubmissionStatus;

    @ApiProperty({ description: "Điểm số", required: false })
    score?: number;

    @ApiProperty({ description: "Thời gian thực thi (ms)", required: false })
    execution_time_ms?: number;

    @ApiProperty({ description: "Bộ nhớ sử dụng (MB)", required: false })
    memory_used_mb?: number;

    @ApiProperty({ description: "Số test case đã pass", required: false })
    test_cases_passed?: number;

    @ApiProperty({ description: "Tổng số test case", required: false })
    total_test_cases?: number;

    @ApiProperty({ description: "Thông báo lỗi", required: false })
    error_message?: string;

    @ApiProperty({ description: "Token Judge0", required: false })
    submission_token?: string;

    @ApiProperty({ description: "Thời gian nộp bài" })
    submitted_at?: Date;

    @ApiProperty({
        description: "Thời gian hoàn thành chấm bài",
        required: false,
    })
    judged_at?: Date;
}
