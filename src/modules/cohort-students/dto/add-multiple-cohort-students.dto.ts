import { ApiProperty } from "@nestjs/swagger";
import { IsArray, ArrayNotEmpty, IsString } from "class-validator";

export class AddMultipleCohortStudentsDto {
    @ApiProperty({
        description: "Danh sách student_id cần thêm vào khóa học",
        type: [String],
        example: ["64f1234567890abcdef12345", "64f1234567890abcdef12346"],
    })
    @IsArray()
    @ArrayNotEmpty({ message: "Danh sách student_id không được để trống" })
    @IsString({ each: true })
    student_ids: string[];
}
