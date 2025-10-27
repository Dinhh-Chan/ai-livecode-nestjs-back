import { ApiProperty } from "@nestjs/swagger";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class UserStatisticsDto {
    @ApiProperty({
        description: "Tổng số bài nộp",
        example: 150,
    })
    @EntityDefinition.field({ label: "Tổng số bài nộp" })
    total_submissions: number;

    @ApiProperty({
        description: "Số bài được chấp nhận (AC)",
        example: 45,
    })
    @EntityDefinition.field({ label: "Số bài được chấp nhận" })
    accepted_submissions: number;

    @ApiProperty({
        description: "Số bài sai đáp án (WA)",
        example: 30,
    })
    @EntityDefinition.field({ label: "Số bài sai đáp án" })
    wrong_answer_submissions: number;

    @ApiProperty({
        description: "Số bài vượt quá thời gian (TLE)",
        example: 25,
    })
    @EntityDefinition.field({ label: "Số bài vượt quá thời gian" })
    time_limit_exceeded_submissions: number;

    @ApiProperty({
        description: "Số bài vượt quá bộ nhớ (MLE)",
        example: 15,
    })
    @EntityDefinition.field({ label: "Số bài vượt quá bộ nhớ" })
    memory_limit_exceeded_submissions: number;

    @ApiProperty({
        description: "Số bài lỗi runtime (RE)",
        example: 20,
    })
    @EntityDefinition.field({ label: "Số bài lỗi runtime" })
    runtime_error_submissions: number;

    @ApiProperty({
        description: "Số bài lỗi compile (CE)",
        example: 10,
    })
    @EntityDefinition.field({ label: "Số bài lỗi compile" })
    compile_error_submissions: number;

    @ApiProperty({
        description: "Số bài đang chờ chấm",
        example: 5,
    })
    @EntityDefinition.field({ label: "Số bài đang chờ chấm" })
    pending_submissions: number;

    @ApiProperty({
        description: "Tỷ lệ thành công (%)",
        example: 30.0,
    })
    @EntityDefinition.field({ label: "Tỷ lệ thành công" })
    success_rate: number;

    @ApiProperty({
        description: "Điểm trung bình",
        example: 7.5,
    })
    @EntityDefinition.field({ label: "Điểm trung bình" })
    average_score: number;

    @ApiProperty({
        description: "Xếp hạng trong hệ thống",
        example: 15,
    })
    @EntityDefinition.field({ label: "Xếp hạng" })
    ranking: number;

    @ApiProperty({
        description: "Tổng số người dùng trong hệ thống",
        example: 1000,
    })
    @EntityDefinition.field({ label: "Tổng số người dùng" })
    total_users: number;

    @ApiProperty({
        description: "Ngày nộp bài cuối cùng",
        example: "2024-01-15T10:30:00.000Z",
    })
    @EntityDefinition.field({ label: "Ngày nộp bài cuối cùng" })
    last_submission_date: string | null;

    @ApiProperty({
        description: "Số bài đã giải được (unique problems)",
        example: 25,
    })
    @EntityDefinition.field({ label: "Số bài đã giải được" })
    solved_problems_count: number;

    @ApiProperty({
        description: "Thống kê theo ngôn ngữ lập trình",
        example: {
            python: 80,
            cpp: 40,
            java: 30,
        },
    })
    @EntityDefinition.field({ label: "Thống kê theo ngôn ngữ" })
    language_stats: Record<string, number>;
}
