import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RequestJoinContestDto {
    @ApiProperty({
        description: "ID của contest muốn tham gia",
        example: "64f1234567890abcdef12345",
    })
    @IsString()
    @IsNotEmpty({ message: "Contest ID không được để trống" })
    contest_id: string;
}
