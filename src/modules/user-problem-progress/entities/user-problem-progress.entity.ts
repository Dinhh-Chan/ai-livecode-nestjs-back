import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
    IsString,
    IsOptional,
    IsBoolean,
    IsNumber,
    IsDate,
} from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.USER_PROBLEM_PROGRESS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class UserProblemProgress implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * User ID - liên kết với bảng users
     */
    @IsString()
    @Prop({ ref: Entity.USER, required: true })
    @EntityDefinition.field({ label: "User ID", required: true })
    user_id: string;

    /**
     * Problem ID - liên kết với bảng problems
     */
    @IsString()
    @Prop({ ref: Entity.PROBLEMS, required: true })
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    /**
     * Đã giải được bài tập chưa
     */
    @IsBoolean()
    @Prop({ default: false })
    @EntityDefinition.field({ label: "Đã giải được" })
    is_solved: boolean;

    /**
     * Đã thử làm bài tập chưa
     */
    @IsBoolean()
    @Prop({ default: false })
    @EntityDefinition.field({ label: "Đã thử làm" })
    is_attempted: boolean;

    /**
     * Thời điểm lần đầu thử làm
     */
    @IsDate()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Thời điểm lần đầu thử làm" })
    first_attempt_at?: Date;

    /**
     * Thời điểm giải được bài tập
     */
    @IsDate()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Thời điểm giải được" })
    solved_at?: Date;

    /**
     * Điểm số tốt nhất
     */
    @IsNumber()
    @IsOptional()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Điểm số tốt nhất" })
    best_score?: number;

    /**
     * Số lần thử làm
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Số lần thử làm" })
    attempt_count: number;

    /**
     * Tổng thời gian làm bài (giây)
     */
    @IsNumber()
    @IsOptional()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Tổng thời gian làm bài (giây)" })
    total_time_spent?: number;

    /**
     * Trạng thái cuối cùng
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Trạng thái cuối cùng" })
    last_status?: string;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "User",
        disableImport: true,
        propertyTarget: "Users",
    })
    user?: any;

    @EntityDefinition.field({
        label: "Problem",
        disableImport: true,
        propertyTarget: "Problems",
    })
    problem?: any;
}

export type UserProblemProgressDocument = HydratedDocument<UserProblemProgress>;
export const UserProblemProgressSchema =
    SchemaFactory.createForClass(UserProblemProgress);

// Virtual relationships
UserProblemProgressSchema.virtual("user", {
    ref: Entity.USER,
    localField: "user_id",
    foreignField: "_id",
    justOne: true,
});

UserProblemProgressSchema.virtual("problem", {
    ref: Entity.PROBLEMS,
    localField: "problem_id",
    foreignField: "_id",
    justOne: true,
});
