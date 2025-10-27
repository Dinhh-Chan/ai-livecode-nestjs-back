import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsDate,
    IsString,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class UpdateUserProblemProgressDto {
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
