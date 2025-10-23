import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsDateString,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateClassStudentsDto {
    @IsString()
    @IsNotEmpty({ message: "ID class student không được để trống" })
    @EntityDefinition.field({ label: "ID class student", required: true })
    class_student_id: string;

    @IsString()
    @IsNotEmpty({ message: "ID lớp học không được để trống" })
    @EntityDefinition.field({ label: "ID lớp học", required: true })
    class_id: string;

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
