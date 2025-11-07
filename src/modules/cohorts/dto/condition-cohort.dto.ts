import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsBoolean, IsDateString } from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { Cohort } from "../entities/cohorts.entity";

export class ConditionCohortDto extends PartialType(Cohort) {
    @ApiProperty({
        description: "Tìm kiếm theo mã khóa học",
        example: "K15",
        required: false,
    })
    @IsString()
    @IsOptional()
    code?: string;

    @ApiProperty({
        description: "Tìm kiếm theo tên khóa học",
        example: "Khóa 15",
        required: false,
    })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({
        description: "Tìm kiếm theo thời gian bắt đầu từ",
        example: "2023-01-01T00:00:00.000Z",
        required: false,
    })
    @IsDateString()
    @IsOptional()
    start_time_from?: Date;

    @ApiProperty({
        description: "Tìm kiếm theo thời gian bắt đầu đến",
        example: "2023-12-31T00:00:00.000Z",
        required: false,
    })
    @IsDateString()
    @IsOptional()
    start_time_to?: Date;

    @ApiProperty({
        description: "Tìm kiếm theo thời gian kết thúc từ",
        example: "2027-01-01T00:00:00.000Z",
        required: false,
    })
    @IsDateString()
    @IsOptional()
    end_time_from?: Date;

    @ApiProperty({
        description: "Tìm kiếm theo thời gian kết thúc đến",
        example: "2027-12-31T00:00:00.000Z",
        required: false,
    })
    @IsDateString()
    @IsOptional()
    end_time_to?: Date;

    @ApiProperty({
        description: "Tìm kiếm theo trạng thái hoạt động",
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean;
}
