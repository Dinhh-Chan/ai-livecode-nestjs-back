import { ApiProperty } from "@nestjs/swagger";
import { SubmissionStatus } from "../entities/student-submissions.entity";
import { User } from "@module/user/entities/user.entity";

export class SubmissionResponseDto {
    @ApiProperty({ description: "ID của submission" })
    _id: string;

    @ApiProperty({ description: "ID submission" })
    submission_id: string;

    @ApiProperty({ description: "ID của sinh viên" })
    student_id: string;

    @ApiProperty({ description: "ID của lớp học", required: false })
    class_id?: string;

    @ApiProperty({ description: "Mã nguồn" })
    code: string;

    @ApiProperty({
        description: "ID ngôn ngữ lập trình (Judge0 language_id)",
        example: 71,
    })
    language_id: number;

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

    @ApiProperty({
        description: "Thông tin bài tập",
    })
    problem?: {
        _id: string;
        name: string;
        description: string;
        difficulty: number;
        time_limit_ms: number;
        memory_limit_mb: number;
        number_of_tests: number;
    };
}
