import { ApiProperty } from "@nestjs/swagger";

export class RecentACDto {
    @ApiProperty({
        example: "64f1234567890abcdef12345",
        description: "Problem ID",
    })
    problem_id: string;

    @ApiProperty({ example: "Two Sum", description: "Tên bài tập" })
    problem_name: string;

    @ApiProperty({
        example: "2024-01-15T10:30:00Z",
        description: "Thời điểm AC",
    })
    solved_at: Date;
}
