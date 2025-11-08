import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsEnum, IsNotEmpty } from "class-validator";
import { HydratedDocument } from "mongoose";

export enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant",
}

@Schema({
    collection: Entity.MESSAGES,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class Message implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID của session
     */
    @IsString()
    @Prop({ required: true, ref: Entity.SESSIONS })
    @EntityDefinition.field({ label: "ID session", required: true })
    session_id: string;

    /**
     * Vai trò người gửi (user hoặc assistant)
     */
    @IsEnum(MessageRole)
    @Prop({
        required: true,
        type: String,
        enum: Object.values(MessageRole),
    })
    @EntityDefinition.field({
        label: "Vai trò",
        required: true,
        enum: Object.values(MessageRole),
        example: MessageRole.USER,
    })
    role: MessageRole;

    /**
     * Nội dung tin nhắn
     */
    @IsString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Nội dung tin nhắn", required: true })
    content: string;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Session",
        disableImport: true,
        propertyTarget: "Session",
    })
    session?: any;
}

export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);

// Virtual relationships
MessageSchema.virtual("session", {
    ref: Entity.SESSIONS,
    localField: "session_id",
    foreignField: "_id",
    justOne: true,
});
