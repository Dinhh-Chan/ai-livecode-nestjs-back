import { IsArray, ArrayNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddMultipleProblemsDto {
    @ApiProperty({
        description: "Danh sách problem IDs cần thêm vào contest",
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty({ message: "Danh sách problems không được để trống" })
    @IsString({
        each: true,
        message: "Mỗi problem phải là một chuỗi ID hợp lệ",
    })
    problems: string[];
}
