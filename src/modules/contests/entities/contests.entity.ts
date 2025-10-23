import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
    IsString,
    IsOptional,
    IsNumber,
    IsDateString,
    IsBoolean,
} from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.CONTESTS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class Contests implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * Tên cuộc thi
     */
    @IsString()
    @Prop({ required: true, maxlength: 200 })
    @EntityDefinition.field({ label: "Tên cuộc thi", required: true })
    contest_name: string;

    /**
     * Mô tả cuộc thi
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Mô tả cuộc thi" })
    description?: string;

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
     * Thời gian tạo
     */
    @IsDateString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Thời gian tạo", required: true })
    created_time: Date;

    /**
     * Trạng thái cuộc thi (active/inactive)
     */
    @IsBoolean()
    @Prop({ default: true })
    @EntityDefinition.field({ label: "Trạng thái cuộc thi" })
    is_active: boolean;

    /**
     * Thời gian làm bài (phút)
     */
    @IsNumber()
    @IsOptional()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Thời gian làm bài (phút)" })
    duration_minutes?: number;

    /**
     * Số lượng bài tập tối đa
     */
    @IsNumber()
    @IsOptional()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Số lượng bài tập tối đa" })
    max_problems?: number;

    /**
     * Thứ tự sắp xếp
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Thứ tự sắp xếp" })
    order_index: number;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Contest Users",
        disableImport: true,
        propertyTarget: "ContestUsers",
    })
    contest_users?: any[];

    @EntityDefinition.field({
        label: "Contest Problems",
        disableImport: true,
        propertyTarget: "ContestProblems",
    })
    contest_problems?: any[];
}

export type ContestsDocument = HydratedDocument<Contests>;
export const ContestsSchema = SchemaFactory.createForClass(Contests);

// Virtual relationships
ContestsSchema.virtual("contest_users", {
    ref: Entity.CONTEST_USERS,
    localField: "_id",
    foreignField: "contest_id",
});

ContestsSchema.virtual("contest_problems", {
    ref: Entity.CONTEST_PROBLEMS,
    localField: "_id",
    foreignField: "contest_id",
});
