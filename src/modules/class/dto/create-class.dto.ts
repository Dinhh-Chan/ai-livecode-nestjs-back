import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsDateString,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateClassDto {
    @IsString()
    @IsNotEmpty({ message: "ID lớp học không được để trống" })
    @EntityDefinition.field({ label: "ID lớp học", required: true })
    class_id: string;

    @IsString()
    @IsNotEmpty({ message: "Tên lớp học không được để trống" })
    @EntityDefinition.field({ label: "Tên lớp học", required: true })
    class_name: string;

    @IsString()
    @IsNotEmpty({ message: "Mã lớp học không được để trống" })
    @EntityDefinition.field({ label: "Mã lớp học", required: true })
    class_code: string;

    @IsString()
    @IsNotEmpty({ message: "ID khóa học không được để trống" })
    @EntityDefinition.field({ label: "ID khóa học", required: true })
    course_id: string;

    @IsString()
    @IsNotEmpty({ message: "ID giáo viên không được để trống" })
    @EntityDefinition.field({ label: "ID giáo viên", required: true })
    teacher_id: string;

    @IsDateString()
    @IsNotEmpty({ message: "Thời gian bắt đầu không được để trống" })
    @EntityDefinition.field({ label: "Thời gian bắt đầu", required: true })
    start_time: Date;

    @IsDateString()
    @IsNotEmpty({ message: "Thời gian kết thúc không được để trống" })
    @EntityDefinition.field({ label: "Thời gian kết thúc", required: true })
    end_time: Date;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Mô tả lớp học" })
    description?: string;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Trạng thái hoạt động" })
    is_active?: boolean;
}
