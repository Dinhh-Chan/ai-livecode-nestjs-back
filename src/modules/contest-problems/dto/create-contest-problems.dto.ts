import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsDateString,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateContestProblemsDto {
    @IsString()
    @IsNotEmpty({ message: "Contest ID không được để trống" })
    @EntityDefinition.field({ label: "Contest ID", required: true })
    contest_id: string;

    @IsString()
    @IsNotEmpty({ message: "Problem ID không được để trống" })
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự hiển thị" })
    order_index?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Điểm số" })
    score?: number;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Hiển thị trong contest" })
    is_visible?: boolean;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời gian bắt đầu submit" })
    start_time?: Date;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời gian kết thúc submit" })
    end_time?: Date;
}
