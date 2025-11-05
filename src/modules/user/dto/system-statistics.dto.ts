import { ApiProperty } from "@nestjs/swagger";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class SystemStatisticsDto {
    @ApiProperty({
        description: "Tổng số submissions trong hệ thống",
        example: 10000,
    })
    @EntityDefinition.field({ label: "Tổng số submissions" })
    total_submissions: number;

    @ApiProperty({
        description: "Tổng số submissions hôm nay",
        example: 150,
    })
    @EntityDefinition.field({ label: "Submissions hôm nay" })
    today_submissions: number;

    @ApiProperty({
        description: "Tổng số submissions tuần này",
        example: 1200,
    })
    @EntityDefinition.field({ label: "Submissions tuần này" })
    this_week_submissions: number;

    @ApiProperty({
        description: "Tổng số submissions tháng này",
        example: 5000,
    })
    @EntityDefinition.field({ label: "Submissions tháng này" })
    this_month_submissions: number;

    @ApiProperty({
        description: "Tổng số users trong hệ thống",
        example: 500,
    })
    @EntityDefinition.field({ label: "Tổng số users" })
    total_users: number;

    @ApiProperty({
        description: "Tổng số problems trong hệ thống",
        example: 200,
    })
    @EntityDefinition.field({ label: "Tổng số problems" })
    total_problems: number;

    @ApiProperty({
        description: "Tỷ lệ AC tổng của hệ thống (%)",
        example: 35.5,
    })
    @EntityDefinition.field({ label: "Tỷ lệ AC tổng" })
    overall_ac_rate: number;

    @ApiProperty({
        description: "Thống kê submissions theo ngày trong 7 ngày gần nhất",
        example: [
            { date: "2024-01-15", count: 120 },
            { date: "2024-01-16", count: 150 },
            { date: "2024-01-17", count: 180 },
        ],
    })
    @EntityDefinition.field({ label: "Thống kê theo ngày" })
    daily_submissions: Array<{ date: string; count: number }>;

    @ApiProperty({
        description: "Thống kê submissions theo tuần trong 4 tuần gần nhất",
        example: [
            { week: "2024-W03", count: 800 },
            { week: "2024-W04", count: 950 },
            { week: "2024-W05", count: 1100 },
        ],
    })
    @EntityDefinition.field({ label: "Thống kê theo tuần" })
    weekly_submissions: Array<{ week: string; count: number }>;

    @ApiProperty({
        description: "Thống kê submissions theo tháng trong 6 tháng gần nhất",
        example: [
            { month: "2024-01", count: 3000 },
            { month: "2024-02", count: 3500 },
            { month: "2024-03", count: 4000 },
        ],
    })
    @EntityDefinition.field({ label: "Thống kê theo tháng" })
    monthly_submissions: Array<{ month: string; count: number }>;

    @ApiProperty({
        description: "Thống kê AC rate theo từng problem",
        example: [
            {
                problem_id: "prob_123",
                problem_name: "Bài tập 1",
                total_submissions: 100,
                accepted_submissions: 30,
                ac_rate: 30.0,
            },
        ],
    })
    @EntityDefinition.field({ label: "AC rate theo problem" })
    problem_ac_stats: Array<{
        problem_id: string;
        problem_name: string;
        total_submissions: number;
        accepted_submissions: number;
        ac_rate: number;
    }>;

    @ApiProperty({
        description: "Thống kê AC rate theo từng user",
        example: [
            {
                user_id: "user_123",
                username: "student1",
                total_submissions: 50,
                accepted_submissions: 20,
                ac_rate: 40.0,
            },
        ],
    })
    @EntityDefinition.field({ label: "AC rate theo user" })
    user_ac_stats: Array<{
        user_id: string;
        username: string;
        total_submissions: number;
        accepted_submissions: number;
        ac_rate: number;
    }>;

    @ApiProperty({
        description: "Thống kê theo ngôn ngữ lập trình",
        example: {
            python: 5000,
            cpp: 3000,
            java: 2000,
        },
    })
    @EntityDefinition.field({ label: "Thống kê theo ngôn ngữ" })
    language_stats: Record<string, number>;

    @ApiProperty({
        description: "Thống kê theo trạng thái submission",
        example: {
            accepted: 3500,
            wrong_answer: 2500,
            time_limit_exceeded: 1500,
            runtime_error: 1000,
            compile_error: 500,
        },
    })
    @EntityDefinition.field({ label: "Thống kê theo trạng thái" })
    status_stats: Record<string, number>;

    @ApiProperty({
        description: "Top 10 users có nhiều submissions nhất",
        example: [
            {
                user_id: "user_123",
                username: "top_user",
                total_submissions: 500,
                accepted_submissions: 200,
            },
        ],
    })
    @EntityDefinition.field({ label: "Top users" })
    top_users: Array<{
        user_id: string;
        username: string;
        total_submissions: number;
        accepted_submissions: number;
    }>;

    @ApiProperty({
        description: "Top 10 problems được submit nhiều nhất",
        example: [
            {
                problem_id: "prob_123",
                problem_name: "Popular Problem",
                total_submissions: 300,
                accepted_submissions: 100,
            },
        ],
    })
    @EntityDefinition.field({ label: "Top problems" })
    top_problems: Array<{
        problem_id: string;
        problem_name: string;
        total_submissions: number;
        accepted_submissions: number;
    }>;

    @ApiProperty({
        description: "Thống kê theo độ khó của problems",
        example: {
            easy: { total: 1000, accepted: 600, ac_rate: 60.0 },
            medium: { total: 800, accepted: 400, ac_rate: 50.0 },
            normal: { total: 500, accepted: 200, ac_rate: 40.0 },
            hard: { total: 300, accepted: 100, ac_rate: 33.33 },
            very_hard: { total: 100, accepted: 20, ac_rate: 20.0 },
        },
    })
    @EntityDefinition.field({ label: "Thống kê theo độ khó" })
    difficulty_stats: Record<
        string,
        { total: number; accepted: number; ac_rate: number }
    >;

    @ApiProperty({
        description: "Số lượng users hoạt động (có submission)",
        example: {
            today: 50,
            this_week: 200,
            this_month: 500,
        },
    })
    @EntityDefinition.field({ label: "Active users" })
    active_users: {
        today: number;
        this_week: number;
        this_month: number;
    };

    @ApiProperty({
        description:
            "Tổng số bài tập đã được giải thành công (unique problems)",
        example: 150,
    })
    @EntityDefinition.field({ label: "Tổng số bài đã giải được" })
    total_solved_problems: number;
}
