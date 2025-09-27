import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional, IsEnum } from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { ProblemDifficulty } from "../entities/problems.entity";

export class CreateProblemsDto {
    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Topic ID" })
    topic_id?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Sub Topic ID" })
    sub_topic_id?: string;

    @IsString()
    @IsNotEmpty({ message: "Tên bài tập không được để trống" })
    @EntityDefinition.field({ label: "Tên bài tập", required: true })
    name: string;

    @IsString()
    @IsNotEmpty({ message: "Mô tả bài tập không được để trống" })
    @EntityDefinition.field({ label: "Mô tả bài tập", required: true })
    description: string;

    @IsEnum(ProblemDifficulty)
    @IsOptional()
    @EntityDefinition.field({ 
        label: "Mức độ khó", 
        enum: Object.values(ProblemDifficulty),
        example: ProblemDifficulty.EASY
    })
    difficulty?: ProblemDifficulty;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Template code" })
    code_template?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Hướng dẫn giải" })
    guidelines?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Lời giải" })
    solution?: string;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Giới hạn thời gian (ms)" })
    time_limit_ms?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Giới hạn bộ nhớ (MB)" })
    memory_limit_mb?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Số lượng test case" })
    number_of_tests?: number;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Bài tập công khai" })
    is_public?: boolean;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Trạng thái hoạt động" })
    is_active?: boolean;
}
