import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class CourseStudents implements BaseEntity {
    _id: string;

    @IsString()
    @EntityDefinition.field({ label: "ID khóa học", required: true })
    course_id: string;

    @IsString()
    @EntityDefinition.field({ label: "ID học viên", required: true })
    student_id: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm tham gia", required: false })
    join_at?: Date;
}
