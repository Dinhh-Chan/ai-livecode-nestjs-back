import {
    IsString,
    IsNotEmpty,
    IsBoolean,
    IsNumber,
    IsOptional,
    IsDate,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateUserProblemProgressDto {
    @IsString()
    @IsNotEmpty({ message: "User ID không được để trống" })
    @EntityDefinition.field({ label: "User ID", required: true })
    user_id: string;

    @IsString()
    @IsNotEmpty({ message: "Problem ID không được để trống" })
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Đã giải được" })
    is_solved?: boolean;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Đã thử làm" })
    is_attempted?: boolean;

    @IsDate()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm lần đầu thử làm" })
    first_attempt_at?: Date;

    @IsDate()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời điểm giải được" })
    solved_at?: Date;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Điểm số tốt nhất" })
    best_score?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Số lần thử làm" })
    attempt_count?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Tổng thời gian làm bài (giây)" })
    total_time_spent?: number;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Trạng thái cuối cùng" })
    last_status?: string;
}
