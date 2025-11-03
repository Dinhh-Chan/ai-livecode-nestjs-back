import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsEnum,
    IsDateString,
} from "class-validator";
import { HydratedDocument } from "mongoose";

export enum ContestUserStatus {
    PENDING = "pending",
    ENROLLED = "enrolled",
    REJECTED = "rejected",
}

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

    /**
     * Trạng thái tham gia contest
     */
    @IsEnum(ContestUserStatus)
    @Prop({ default: ContestUserStatus.PENDING })
    @EntityDefinition.field({
        label: "Trạng thái tham gia",
        enum: Object.values(ContestUserStatus),
        example: ContestUserStatus.PENDING,
    })
    status: ContestUserStatus;

    /**
     * Thời điểm user bắt đầu làm bài trong contest
     */
    @IsDateString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Thời điểm bắt đầu làm bài" })
    start_at?: Date;
}

export type ContestUsersDocument = HydratedDocument<ContestUsers>;
export const ContestUsersSchema = SchemaFactory.createForClass(ContestUsers);
