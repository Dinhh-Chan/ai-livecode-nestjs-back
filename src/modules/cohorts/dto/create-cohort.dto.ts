import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsDateString } from "class-validator";

export class CreateCohortDto {
    @ApiProperty({
        description: "Mã khóa học",
        example: "K15",
    })
    @IsString()
    code: string;

    @ApiProperty({
        description: "Tên khóa học",
        example: "Khóa 15 - Công nghệ thông tin",
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: "Thời gian bắt đầu",
        example: "2023-09-01T00:00:00.000Z",
    })
    @IsDateString()
    start_time: Date;

    @ApiProperty({
        description: "Thời gian kết thúc",
        example: "2027-06-30T00:00:00.000Z",
    })
    @IsDateString()
    end_time: Date;

    @ApiProperty({
        description: "Mô tả khóa học",
        example: "Khóa đào tạo kỹ sư công nghệ thông tin",
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: "Trạng thái hoạt động",
        example: true,
        default: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
