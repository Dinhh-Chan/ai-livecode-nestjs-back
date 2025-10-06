import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsNumber } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.SUB_TOPICS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class SubTopics implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * Topic ID - liên kết với bảng topics
     */
    @IsString()
    @Prop({ required: true, ref: Entity.TOPICS })
    @EntityDefinition.field({ label: "Topic ID", required: true })
    topic_id: string;

    /**
     * Tên chủ đề con
     */
    @IsString()
    @Prop({ required: true, maxlength: 100 })
    @EntityDefinition.field({ label: "Tên chủ đề con", required: true })
    sub_topic_name: string;

    /**
     * Mô tả chủ đề con
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Mô tả chủ đề con" })
    description?: string;

    /**
     * Learning objectives
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Mục tiêu học tập" })
    lo?: string;

    /**
     * Thứ tự sắp xếp
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Thứ tự sắp xếp" })
    order_index: number;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Topic",
        disableImport: true,
        propertyTarget: "Topics",
    })
    topic?: any;

    @EntityDefinition.field({
        label: "Problems",
        disableImport: true,
        propertyTarget: "Problems",
    })
    problems?: any[];
}

export type SubTopicsDocument = HydratedDocument<SubTopics>;
export const SubTopicsSchema = SchemaFactory.createForClass(SubTopics);

// Virtual relationships
SubTopicsSchema.virtual("topic", {
    ref: Entity.TOPICS,
    localField: "topic_id",
    foreignField: "_id",
    justOne: true,
});

SubTopicsSchema.virtual("problems", {
    ref: Entity.PROBLEMS,
    localField: "_id",
    foreignField: "sub_topic_id",
});
