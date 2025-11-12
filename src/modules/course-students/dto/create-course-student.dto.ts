import { EntityDefinition } from "@common/constant/class/entity-definition";
import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
} from "class-validator";

export class CreateCourseStudentDto {
    @IsString()
    @IsNotEmpty({ message: "course_id không được để trống" })
    @EntityDefinition.field({ label: "ID khóa học", required: true })
    course_id: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({
        label: "ID học viên (tự động lấy từ user hiện tại nếu không có)",
    })
    student_id?: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm tham gia" })
    join_at?: Date;
}
