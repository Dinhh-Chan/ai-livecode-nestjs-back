import { IsString, IsNumber, IsOptional, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProblemItemDto {
    @ApiProperty({
        description: "Problem ID",
        example: "64f1234567890abcdef12345",
    })
    @IsString()
    @IsNotEmpty({ message: "Problem ID không được để trống" })
    problem_id: string;

    @ApiProperty({
        description: "Thứ tự hiển thị trong contest",
        example: 1,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    order_index?: number;

    @ApiProperty({
        description: "Điểm số của bài tập trong contest",
        example: 100,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    score?: number;

    @ApiProperty({
        description: "Có hiển thị bài tập này trong contest không",
        example: true,
        required: false,
    })
    @IsOptional()
    is_visible?: boolean;
}
