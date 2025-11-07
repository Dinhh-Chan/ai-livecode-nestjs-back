import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsEnum } from "class-validator";
import { HydratedDocument } from "mongoose";

export enum FeedbackType {
    FEEDBACK = "feedback",
    ERROR = "error",
}

export enum FeedbackStatus {
    PENDING = "pending",
    DOING = "doing",
    FIXED = "fixed",
    REJECTED = "rejected",
}

@Schema({
    collection: Entity.FEEDBACK,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class Feedback implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID của user tạo feedback
     */
    @IsString()
    @Prop({ required: true, ref: Entity.USER })
    @EntityDefinition.field({ label: "ID người dùng", required: true })
    user_id: string;

    /**
     * Loại feedback (feedback hoặc error)
     */
    @IsEnum(FeedbackType)
    @Prop({
        required: true,
        type: String,
        enum: Object.values(FeedbackType),
    })
    @EntityDefinition.field({
        label: "Loại feedback",
        required: true,
        enum: Object.values(FeedbackType),
        example: FeedbackType.FEEDBACK,
    })
    type: FeedbackType;

    /**
     * Tiêu đề feedback
     */
    @IsString()
    @Prop({ required: true, maxlength: 200 })
    @EntityDefinition.field({ label: "Tiêu đề", required: true })
    title: string;

    /**
     * Mô tả chi tiết
     */
    @IsString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Mô tả", required: true })
    description: string;

    /**
     * Trạng thái xử lý
     */
    @IsEnum(FeedbackStatus)
    @Prop({
        required: true,
        type: String,
        enum: Object.values(FeedbackStatus),
        default: FeedbackStatus.PENDING,
    })
    @EntityDefinition.field({
        label: "Trạng thái",
        required: true,
        enum: Object.values(FeedbackStatus),
        example: FeedbackStatus.PENDING,
    })
    status: FeedbackStatus;

    /**
     * Ghi chú từ admin (nếu có)
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Ghi chú" })
    admin_note?: string;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Người dùng",
        disableImport: true,
        propertyTarget: "User",
    })
    user?: any;
}

export type FeedbackDocument = HydratedDocument<Feedback>;
export const FeedbackSchema = SchemaFactory.createForClass(Feedback);

// Virtual relationships
FeedbackSchema.virtual("user", {
    ref: Entity.USER,
    localField: "user_id",
    foreignField: "_id",
    justOne: true,
});
