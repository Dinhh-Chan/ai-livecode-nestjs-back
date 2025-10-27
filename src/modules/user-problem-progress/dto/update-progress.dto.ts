import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class UpdateProgressDto {
    @IsString()
    @IsNotEmpty({ message: "Problem ID không được để trống" })
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    @IsString()
    @IsNotEmpty({ message: "Status không được để trống" })
    @EntityDefinition.field({ label: "Status", required: true })
    status: string;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Score" })
    score?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Time spent (seconds)" })
    time_spent?: number;
}
