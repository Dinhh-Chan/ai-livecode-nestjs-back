import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsNumber } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.TOPICS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class Topics implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * Tên chủ đề
     */
    @IsString()
    @Prop({ required: true, maxlength: 100 })
    @EntityDefinition.field({ label: "Tên chủ đề", required: true })
    topic_name: string;

    /**
     * Mô tả chủ đề
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Mô tả chủ đề" })
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
        label: "Sub Topics",
        disableImport: true,
        propertyTarget: "SubTopics",
    })
    sub_topics?: any[];

    @EntityDefinition.field({
        label: "Problems",
        disableImport: true,
        propertyTarget: "Problems",
    })
    problems?: any[];
}

export type TopicsDocument = HydratedDocument<Topics>;
export const TopicsSchema = SchemaFactory.createForClass(Topics);

// Virtual relationships
TopicsSchema.virtual("sub_topics", {
    ref: Entity.SUB_TOPICS,
    localField: "_id",
    foreignField: "topic_id",
});

TopicsSchema.virtual("problems", {
    ref: Entity.PROBLEMS,
    localField: "_id",
    foreignField: "topic_id",
});
