import { ApiProperty } from "@nestjs/swagger";
import { ContestRankingItemDto } from "./contest-ranking-item.dto";

export class ContestRankingDto {
    @ApiProperty({
        type: [ContestRankingItemDto],
        description: "Danh sách ranking của contest",
    })
    ranking: ContestRankingItemDto[];
}
