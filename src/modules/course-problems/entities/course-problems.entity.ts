import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CourseProblems implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "ID khóa học", required: true })
    course_id: string;

    @IsString()
    @EntityDefinition.field({ label: "ID bài tập", required: true })
    problem_id: string;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự", required: false })
    order_index?: number;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Hiển thị", required: false })
    is_visible?: boolean;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Bắt buộc", required: false })
    is_required?: boolean;
}
