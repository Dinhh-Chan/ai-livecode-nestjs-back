import { IsString, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubmitContestMultipleChoiceDto {
    @ApiProperty({
        description: "ID của bài tập",
        example: "prob_64f1234567890abcdef12345",
    })
    @IsString()
    problem_id: string;

    @ApiProperty({
        description: "ID của contest",
        example: "contest_64f1234567890abcdef12345",
    })
    @IsString()
    contest_id: string;

    @ApiProperty({
        description: "Đáp án được chọn (số thứ tự của option)",
        example: 2.0,
        type: "number",
    })
    @IsNumber()
    answer: number;
}
