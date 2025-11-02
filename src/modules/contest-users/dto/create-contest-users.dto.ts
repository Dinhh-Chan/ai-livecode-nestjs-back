import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsEnum,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { ContestUserStatus } from "../entities/contest-users.entity";

export class CreateContestUsersDto {
    @IsString()
    @IsNotEmpty({ message: "Contest ID không được để trống" })
    @EntityDefinition.field({ label: "Contest ID", required: true })
    contest_id: string;

    @IsString()
    @IsNotEmpty({ message: "User ID không được để trống" })
    @EntityDefinition.field({ label: "User ID", required: true })
    user_id: string;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Số bài ACCEPT" })
    accepted_count?: number;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Quản lý contest" })
    is_manager?: boolean;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự sắp xếp" })
    order_index?: number;

    @IsEnum(ContestUserStatus)
    @IsOptional()
    @EntityDefinition.field({
        label: "Trạng thái tham gia",
        enum: Object.values(ContestUserStatus),
        example: ContestUserStatus.PENDING,
    })
    status?: ContestUserStatus;
}
