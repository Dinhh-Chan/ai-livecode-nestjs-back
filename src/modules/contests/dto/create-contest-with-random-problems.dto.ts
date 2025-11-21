/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";
import {
    IsString,
    IsOptional,
    IsNumber,
    IsDateString,
    IsBoolean,
    IsEnum,
    IsArray,
    ValidateNested,
    Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ContestType } from "../entities/contests.entity";
import {
    ProblemDifficulty,
    ProblemType,
} from "@module/problems/entities/problems.entity";

export class ProblemConfigDto {
    @ApiProperty({
        description: "Độ khó của bài tập",
        enum: ProblemDifficulty,
        example: ProblemDifficulty.EASY,
    })
    @IsEnum(ProblemDifficulty)
    difficulty: ProblemDifficulty;

    @ApiProperty({
        description: "Số lượng bài tập cần lấy cho độ khó này",
        example: 5,
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    count: number;

    @ApiProperty({
        description: "ID của topic (tùy chọn)",
        required: false,
        example: "68f0a0f12cb1716dfa9f1e4a",
    })
    @IsString()
    @IsOptional()
    topic_id?: string;

    @ApiProperty({
        description: "ID của sub_topic (tùy chọn)",
        required: false,
        example: "68f0a0f12cb1716dfa9f1e4a",
    })
    @IsString()
    @IsOptional()
    sub_topic_id?: string;

    @ApiProperty({
        description: "Loại bài tập (tùy chọn)",
        enum: ProblemType,
        required: false,
        example: ProblemType.COMPLETE_FUNCTION,
    })
    @IsEnum(ProblemType)
    @IsOptional()
    problem_type?: ProblemType;
}

export class CreateContestWithRandomProblemsDto {
    @ApiProperty({
        description: "Tên cuộc thi",
        example: "Cuộc thi lập trình tháng 12",
    })
    @IsString()
    contest_name: string;

    @ApiProperty({
        description: "Mô tả cuộc thi",
        required: false,
        example: "Cuộc thi lập trình dành cho sinh viên",
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: "Thời gian bắt đầu",
        example: "2024-12-01T00:00:00.000Z",
    })
    @IsDateString()
    start_time: string;

    @ApiProperty({
        description: "Thời gian kết thúc",
        example: "2024-12-31T23:59:59.000Z",
    })
    @IsDateString()
    end_time: string;

    @ApiProperty({
        description: "Thời gian làm bài (phút)",
        required: false,
        example: 120,
        default: 0,
    })
    @IsNumber()
    @IsOptional()
    duration_minutes?: number;

    @ApiProperty({
        description: "Loại cuộc thi",
        enum: ContestType,
        example: ContestType.PRACTICE,
        default: ContestType.PRACTICE,
    })
    @IsEnum(ContestType)
    @IsOptional()
    type?: ContestType;

    @ApiProperty({
        description: "Cấu hình các bài tập theo độ khó",
        type: [ProblemConfigDto],
        example: [
            {
                difficulty: ProblemDifficulty.EASY,
                count: 3,
                topic_id: "68f0a0f12cb1716dfa9f1e4a",
            },
            {
                difficulty: ProblemDifficulty.MEDIUM,
                count: 5,
                sub_topic_id: "68f0a0f12cb1716dfa9f1e4b",
            },
            {
                difficulty: ProblemDifficulty.HARD,
                count: 2,
                problem_type: ProblemType.COMPLETE_FUNCTION,
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProblemConfigDto)
    problems_config: ProblemConfigDto[];

    @ApiProperty({
        description: "Điểm số mặc định cho mỗi bài tập",
        required: false,
        example: 100,
        default: 100,
    })
    @IsNumber()
    @IsOptional()
    default_score?: number;

    @ApiProperty({
        description: "Trạng thái hoạt động",
        required: false,
        example: true,
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
