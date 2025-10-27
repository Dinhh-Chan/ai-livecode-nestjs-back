import { IsString, IsBoolean, IsOptional } from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class ConditionUserProblemProgressDto {
    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "User ID" })
    user_id?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Problem ID" })
    problem_id?: string;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Đã giải được" })
    is_solved?: boolean;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Đã thử làm" })
    is_attempted?: boolean;
}
