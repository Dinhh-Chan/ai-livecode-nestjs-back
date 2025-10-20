import { IsString, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCourseDto {
    @ApiProperty({ description: "Tên khóa học", maxLength: 100 })
    @IsString()
    course_name: string;

    @ApiProperty({ description: "Mã khóa học", maxLength: 20 })
    @IsString()
    course_code: string;

    @ApiProperty({ description: "Mô tả khóa học", required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: "Trạng thái hoạt động", default: true })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
