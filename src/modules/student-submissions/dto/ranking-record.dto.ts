import { ApiProperty } from "@nestjs/swagger";
import { UserRecordDto } from "./user-record.dto";

export class RankingRecordDto {
    @ApiProperty({ description: "Thứ hạng" })
    rankNumber: number;

    @ApiProperty({ description: "Thông tin người dùng", type: UserRecordDto })
    user: UserRecordDto;

    @ApiProperty({ description: "Tổng số bài đã giải" })
    totalProblemsSolved: number;
}
