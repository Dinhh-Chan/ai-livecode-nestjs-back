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

    @ApiProperty({
        description: "Phân chia theo độ khó",
        example: {
            easy: { solved: 15, total: 20 },
            medium: { solved: 8, total: 15 },
            hard: { solved: 2, total: 5 },
        },
    })
    @EntityDefinition.field({ label: "Thống kê theo độ khó" })
    difficulty_stats: Record<string, { solved: number; total: number }>;

    @ApiProperty({
        description: "Dữ liệu hoạt động theo ngày",
        example: [
            { date: "2025-01-01", submissions_count: 3 },
            { date: "2025-01-02", submissions_count: 1 },
        ],
    })
    @EntityDefinition.field({ label: "Dữ liệu hoạt động" })
    activity_data: Array<{ date: string; submissions_count: number }>;

    @ApiProperty({
        description: "Tổng số ngày hoạt động",
        example: 45,
    })
    @EntityDefinition.field({ label: "Tổng số ngày hoạt động" })
    total_active_days: number;

    @ApiProperty({
        description: "Chuỗi ngày hoạt động dài nhất",
        example: 7,
    })
    @EntityDefinition.field({ label: "Chuỗi ngày dài nhất" })
    max_streak: number;

    @ApiProperty({
        description: "Chuỗi ngày hoạt động hiện tại",
        example: 3,
    })
    @EntityDefinition.field({ label: "Chuỗi ngày hiện tại" })
    current_streak: number;

    @ApiProperty({
        description: "Bài nộp gần đây",
        example: [
            {
                problem_name: "Two Sum",
                submitted_at: "2025-01-15T10:30:00Z",
                status: "accepted",
                language: "python",
            },
        ],
    })
    @EntityDefinition.field({ label: "Bài nộp gần đây" })
    recent_submissions: Array<{
        problem_name: string;
        submitted_at: string;
        status: string;
        language: string;
    }>;

    @ApiProperty({
        description: "Thống kê tiến trình",
        example: {
            solved: 17,
            total: 39,
            attempting: 5,
        },
    })
    @EntityDefinition.field({ label: "Thống kê tiến trình" })
    progress_stats: {
        solved: number;
        total: number;
        attempting: number;
    };
}
