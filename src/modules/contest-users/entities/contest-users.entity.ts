import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsNumber, IsBoolean } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.CONTEST_USERS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class ContestUsers implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID cuộc thi
     */
    @IsString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Contest ID", required: true })
    contest_id: string;

    /**
     * ID người dùng
     */
    @IsString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "User ID", required: true })
    user_id: string;

    /**
     * Số bài đã ACCEPT trong contest
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Số bài ACCEPT" })
    accepted_count: number;

    /**
     * Có phải người quản lý contest không
     */
    @IsBoolean()
    @Prop({ default: false })
    @EntityDefinition.field({ label: "Quản lý contest" })
    is_manager: boolean;

    /**
     * Thứ tự sắp xếp trong bảng xếp hạng
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Thứ tự sắp xếp" })
    order_index: number;
}

export type ContestUsersDocument = HydratedDocument<ContestUsers>;
export const ContestUsersSchema = SchemaFactory.createForClass(ContestUsers);
