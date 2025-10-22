import { ApiProperty } from "@nestjs/swagger";
import { RankingResponse } from "../interfaces/ranking.interface";
import { RankingRecordDto } from "./ranking-record.dto";

export class RankingResponseDto implements RankingResponse {
    @ApiProperty({
        description: "Danh sách xếp hạng",
        type: [RankingRecordDto],
    })
    rankings: RankingRecordDto[];

    @ApiProperty({ description: "Tổng số người dùng" })
    totalUsers: number;

    @ApiProperty({
        description: "Thứ hạng của người dùng hiện tại",
        type: RankingRecordDto,
        required: false,
    })
    currentUserRank?: RankingRecordDto;
}
