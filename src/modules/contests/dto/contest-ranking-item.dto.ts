import { ApiProperty } from "@nestjs/swagger";
import { ContestRankingUserDto } from "./contest-ranking-user.dto";
import { ContestRankingProblemDto } from "./contest-ranking-problem.dto";

export class ContestRankingItemDto {
    @ApiProperty({
        example: 1,
        description: "Thứ hạng trong contest",
    })
    rank: number;

    @ApiProperty({
        type: ContestRankingUserDto,
        description: "Thông tin user",
    })
    user: ContestRankingUserDto;

    @ApiProperty({
        example: 5,
        description: "Số bài đã AC",
    })
    accepted_count: number;

    @ApiProperty({
        example: 500,
        description: "Tổng điểm số đã đạt được",
    })
    total_score: number;

    @ApiProperty({
        type: [ContestRankingProblemDto],
        description: "Danh sách các bài tập và trạng thái giải của user",
    })
    problems: ContestRankingProblemDto[];
}
