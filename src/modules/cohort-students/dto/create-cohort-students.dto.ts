import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsDateString,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateCohortStudentsDto {
    @IsString()
    @IsNotEmpty({ message: "ID cohort student không được để trống" })
    @EntityDefinition.field({ label: "ID cohort student", required: true })
    cohort_student_id: string;

    @IsString()
    @IsNotEmpty({ message: "ID khóa học không được để trống" })
    @EntityDefinition.field({ label: "ID khóa học", required: true })
    cohort_id: string;

    @IsString()
    @IsNotEmpty({ message: "ID sinh viên không được để trống" })
    @EntityDefinition.field({ label: "ID sinh viên", required: true })
    student_id: string;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời gian đăng ký" })
    enrolled_at?: Date;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Trạng thái hoạt động" })
    is_active?: boolean;
}
