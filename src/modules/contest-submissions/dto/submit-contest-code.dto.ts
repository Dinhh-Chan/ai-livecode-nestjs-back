import { IsString, IsOptional, IsNumber, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubmitContestCodeDto {
    @ApiProperty({
        description: "Mã nguồn của người dùng",
        example: "print('Hello World')",
    })
    @IsString()
    code: string;

    @ApiProperty({
        description: "ID ngôn ngữ lập trình (Judge0 language_id)",
        example: 71,
        type: "number",
    })
    @IsNumber()
    language_id: number;

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
        description: "Input cho chương trình (tùy chọn)",
        example: "5\n1 2 3 4 5",
        required: false,
    })
    @IsString()
    @IsOptional()
    stdin?: string;

    @ApiProperty({
        description: "Giới hạn thời gian thực thi (giây)",
        example: 2.0,
        minimum: 0.1,
        maximum: 15.0,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Min(0.1)
    @Max(15.0)
    cpu_time_limit?: number;

    @ApiProperty({
        description: "Giới hạn bộ nhớ (KB)",
        example: 128000,
        minimum: 1000,
        maximum: 256000,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Min(1000)
    @Max(256000)
    memory_limit?: number;

    @ApiProperty({
        description: "Tùy chọn compiler (tùy chọn)",
        example: "-O2 -std=c++17",
        required: false,
    })
    @IsString()
    @IsOptional()
    compiler_options?: string;

    @ApiProperty({
        description: "Tham số dòng lệnh (tùy chọn)",
        example: "--input-file input.txt",
        required: false,
    })
    @IsString()
    @IsOptional()
    command_line_arguments?: string;
}
