import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.SESSIONS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class Session implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID của user tạo session
     */
    @IsString()
    @Prop({ required: true, ref: Entity.USER })
    @EntityDefinition.field({ label: "ID người dùng", required: true })
    user_id: string;

    /**
     * Tên phiên chat
     */
    @IsString()
    @Prop({ required: true, maxlength: 200 })
    @EntityDefinition.field({ label: "Tên phiên chat", required: true })
    session_name: string;

    /**
     * ID của đề bài
     */
    @IsString()
    @IsOptional()
    @Prop({ ref: Entity.PROBLEMS })
    @EntityDefinition.field({ label: "ID đề bài" })
    question_id?: string;

    /**
     * Nội dung đề bài
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Nội dung đề bài" })
    question_content?: string;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Người dùng",
        disableImport: true,
        propertyTarget: "User",
    })
    user?: any;

    @EntityDefinition.field({
        label: "Tin nhắn",
        disableImport: true,
        propertyTarget: "Message",
    })
    messages?: any[];
}

export type SessionDocument = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);

// Virtual relationships
SessionSchema.virtual("user", {
    ref: Entity.USER,
    localField: "user_id",
    foreignField: "_id",
    justOne: true,
});

SessionSchema.virtual("messages", {
    ref: Entity.MESSAGES,
    localField: "_id",
    foreignField: "session_id",
});
