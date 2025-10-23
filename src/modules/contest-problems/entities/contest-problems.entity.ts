import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsNumber, IsBoolean } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.CONTEST_PROBLEMS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class ContestProblems implements BaseEntity {
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
     * ID bài tập
     */
    @IsString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    /**
     * Thứ tự hiển thị trong contest
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Thứ tự hiển thị" })
    order_index: number;

    /**
     * Điểm số của bài tập trong contest
     */
    @IsNumber()
    @Prop({ default: 100 })
    @EntityDefinition.field({ label: "Điểm số" })
    score: number;

    /**
     * Có hiển thị bài tập này trong contest không
     */
    @IsBoolean()
    @Prop({ default: true })
    @EntityDefinition.field({ label: "Hiển thị trong contest" })
    is_visible: boolean;

    /**
     * Thời gian bắt đầu cho phép submit (nếu có)
     */
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Thời gian bắt đầu submit" })
    start_time?: Date;

    /**
     * Thời gian kết thúc cho phép submit (nếu có)
     */
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Thời gian kết thúc submit" })
    end_time?: Date;
}

export type ContestProblemsDocument = HydratedDocument<ContestProblems>;
export const ContestProblemsSchema =
    SchemaFactory.createForClass(ContestProblems);
