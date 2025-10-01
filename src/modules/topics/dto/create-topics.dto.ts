import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateTopicsDto {
    @IsString()
    @IsNotEmpty({ message: "Tên chủ đề không được để trống" })
    @EntityDefinition.field({ label: "Tên chủ đề", required: true })
    topic_name: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Mô tả chủ đề" })
    description?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Mục tiêu học tập" })
    lo?: string;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự sắp xếp" })
    order_index?: number;
}
