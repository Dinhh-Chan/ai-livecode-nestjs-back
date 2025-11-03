import { IsString, IsArray, ArrayNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddMultipleUsersDto {
    @ApiProperty({
        description: "Danh sách user IDs cần thêm vào contest",
        example: ["64f1234567890abcdef12345", "64f1234567890abcdef12346"],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty({ message: "Danh sách user IDs không được để trống" })
    @IsString({ each: true, message: "Mỗi user ID phải là chuỗi" })
    user_ids: string[];
}
