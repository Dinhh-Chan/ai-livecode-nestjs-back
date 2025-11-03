import { ApiProperty } from "@nestjs/swagger";

export class ContestRankingUserDto {
    @ApiProperty({
        example: "113963c0a9df48538edf310d",
        description: "ID của user",
    })
    _id: string;

    @ApiProperty({
        example: "john_doe",
        description: "Username",
    })
    username: string;

    @ApiProperty({
        example: "John Doe",
        description: "Họ tên đầy đủ",
        required: false,
    })
    fullname?: string;
}
