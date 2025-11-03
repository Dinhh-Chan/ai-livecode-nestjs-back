import { ApiProperty } from "@nestjs/swagger";

export class ContestRankingProblemDto {
    @ApiProperty({
        example: "68fdc3a6fe535fa0f4f1d74a",
        description: "ID của bài tập",
    })
    problem_id: string;

    @ApiProperty({
        example: "Two Sum",
        description: "Tên bài tập",
    })
    problem_name: string;

    @ApiProperty({
        example: true,
        description: "Đã giải được bài này chưa",
    })
    is_solved: boolean;

    @ApiProperty({
        example: 100,
        description: "Điểm số của bài tập trong contest",
    })
    score: number;

    @ApiProperty({
        example: "2024-01-15T10:30:00.000Z",
        description: "Thời gian giải được bài (nếu đã giải)",
        required: false,
    })
    solved_at?: Date;
}
