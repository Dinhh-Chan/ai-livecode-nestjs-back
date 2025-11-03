import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ArrayNotEmpty, IsString } from "class-validator";

export class AddMultipleClassStudentsDto {
    @ApiProperty({
        description: "Danh sách student_id cần thêm vào lớp",
        type: [String],
        example: ["64f1234567890abcdef12345", "64f1234567890abcdef12346"],
    })
    @IsArray()
    @ArrayNotEmpty({ message: "Danh sách student_id không được để trống" })
    @IsString({ each: true })
    student_ids: string[];
}
