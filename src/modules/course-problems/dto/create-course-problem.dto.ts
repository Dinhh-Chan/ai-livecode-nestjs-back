import { EntityDefinition } from "@common/constant/class/entity-definition";
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateCourseProblemDto {
    @IsString()
    @IsNotEmpty({ message: "course_id không được để trống" })
    @EntityDefinition.field({ label: "ID khóa học", required: true })
    course_id: string;

    @IsString()
    @IsNotEmpty({ message: "problem_id không được để trống" })
    @EntityDefinition.field({ label: "ID bài tập", required: true })
    problem_id: string;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự" })
    order_index?: number;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Hiển thị" })
    is_visible?: boolean;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Bắt buộc" })
    is_required?: boolean;
}
