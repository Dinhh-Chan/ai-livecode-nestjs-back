import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsDateString,
    IsBoolean,
    IsEnum,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { ContestType } from "../entities/contests.entity";

export class CreateContestsDto {
    @IsString()
    @IsNotEmpty({ message: "Tên cuộc thi không được để trống" })
    @EntityDefinition.field({ label: "Tên cuộc thi", required: true })
    contest_name: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Mô tả cuộc thi" })
    description?: string;

    @IsDateString()
    @IsNotEmpty({ message: "Thời gian bắt đầu không được để trống" })
    @EntityDefinition.field({ label: "Thời gian bắt đầu", required: true })
    start_time: Date;

    @IsDateString()
    @IsNotEmpty({ message: "Thời gian kết thúc không được để trống" })
    @EntityDefinition.field({ label: "Thời gian kết thúc", required: true })
    end_time: Date;

    @IsDateString()
    @IsNotEmpty({ message: "Thời gian tạo không được để trống" })
    @EntityDefinition.field({ label: "Thời gian tạo", required: true })
    created_time: Date;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Trạng thái cuộc thi" })
    is_active?: boolean;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời gian làm bài (phút)" })
    duration_minutes?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Số lượng bài tập tối đa" })
    max_problems?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự sắp xếp" })
    order_index?: number;

    @IsEnum(ContestType)
    @IsOptional()
    @EntityDefinition.field({
        label: "Loại cuộc thi",
        enum: Object.values(ContestType),
        example: ContestType.PRACTICE,
    })
    type?: ContestType;
}
