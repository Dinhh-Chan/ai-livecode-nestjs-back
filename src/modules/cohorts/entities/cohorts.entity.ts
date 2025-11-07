import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsBoolean, IsDateString } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.COHORTS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class Cohort implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * Mã khóa học
     */
    @IsString()
    @Prop({ required: true, maxlength: 50 })
    @EntityDefinition.field({ label: "Mã khóa học", required: true })
    code: string;

    /**
     * Tên khóa học
     */
    @IsString()
    @Prop({ required: true, maxlength: 100 })
    @EntityDefinition.field({ label: "Tên khóa học", required: true })
    name: string;

    /**
     * Thời gian bắt đầu
     */
    @IsDateString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Thời gian bắt đầu", required: true })
    start_time: Date;

    /**
     * Thời gian kết thúc
     */
    @IsDateString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Thời gian kết thúc", required: true })
    end_time: Date;

    /**
     * Mô tả khóa học
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Mô tả khóa học" })
    description?: string;

    /**
     * Trạng thái hoạt động
     */
    @IsBoolean()
    @Prop({ default: true })
    @EntityDefinition.field({ label: "Trạng thái hoạt động" })
    is_active: boolean;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Sinh viên trong khóa học",
        disableImport: true,
        propertyTarget: "CohortStudent",
    })
    students?: any[];
}

export type CohortDocument = HydratedDocument<Cohort>;
export const CohortSchema = SchemaFactory.createForClass(Cohort);

// Virtual relationships
CohortSchema.virtual("students", {
    ref: Entity.COHORT_STUDENTS,
    localField: "_id",
    foreignField: "cohort_id",
});
