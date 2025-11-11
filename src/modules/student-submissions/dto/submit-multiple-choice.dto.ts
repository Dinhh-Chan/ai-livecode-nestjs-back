import { IsString, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubmitMultipleChoiceDto {
    @ApiProperty({
        description: "ID của bài tập",
        example: "prob_64f1234567890abcdef12345",
    })
    @IsString()
    problem_id: string;

    @ApiProperty({
        description: "ID của lớp học (tùy chọn)",
        example: "class_64f1234567890abcdef12345",
        required: false,
    })
    @IsString()
    @IsOptional()
    class_id?: string;

    @ApiProperty({
        description: "Đáp án được chọn (số thứ tự của option)",
        example: 2.0,
        type: "number",
    })
    @IsNumber()
    answer: number;
}
