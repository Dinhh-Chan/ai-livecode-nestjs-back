import { IsString, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateSubTopicsDto {
    @IsString()
    @IsNotEmpty({ message: "Topic ID không được để trống" })
    @EntityDefinition.field({ label: "Topic ID", required: true })
    topic_id: string;

    @IsString()
    @IsNotEmpty({ message: "Tên chủ đề con không được để trống" })
    @EntityDefinition.field({ label: "Tên chủ đề con", required: true })
    sub_topic_name: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Mô tả chủ đề con" })
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
