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
    IsEnum,
} from "class-validator";
import { HydratedDocument } from "mongoose";
import { SubmissionStatus } from "@module/student-submissions/entities/student-submissions.entity";

@Schema({
    collection: Entity.CONTEST_SUBMISSIONS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class ContestSubmissions implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID của contest
     */
    @IsString()
    @Prop({ required: true, ref: Entity.CONTESTS })
    @EntityDefinition.field({ label: "Contest ID", required: true })
    contest_id: string;

    /**
     * ID của submission gốc (link đến StudentSubmissions)
     */
    @IsString()
    @Prop({ required: true, ref: Entity.STUDENT_SUBMISSIONS })
    @EntityDefinition.field({ label: "Submission ID", required: true })
    submission_id: string;

    /**
     * ID của sinh viên nộp bài
     */
    @IsString()
    @Prop({ required: true, ref: Entity.USER })
    @EntityDefinition.field({ label: "Student ID", required: true })
    student_id: string;

    /**
     * ID của bài tập
     */
    @IsString()
    @Prop({ required: true, ref: Entity.PROBLEMS })
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    /**
     * Mã nguồn đã AC
     */
    @IsString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Source Code", required: true })
    code: string;

    /**
     * ID ngôn ngữ lập trình (Judge0 language_id)
     */
    @IsNumber()
    @Prop({ required: true })
    @EntityDefinition.field({
        label: "Programming Language ID",
        example: 71,
    })
    language_id: number;

    /**
     * Trạng thái chấm bài
     */
    @IsEnum(SubmissionStatus)
    @Prop({ required: true })
    @EntityDefinition.field({
        label: "Submission Status",
        enum: Object.values(SubmissionStatus),
        example: SubmissionStatus.ACCEPTED,
    })
    status: SubmissionStatus;

    /**
     * Điểm số (0.00 - 100.00)
     */
    @IsNumber()
    @IsOptional()
    @Prop({ default: 100.0 })
    @EntityDefinition.field({ label: "Score", example: 100.0 })
    score?: number;

    /**
     * Thời gian thực thi (milliseconds)
     */
    @IsNumber()
    @IsOptional()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Execution Time (ms)", example: 0 })
    execution_time_ms?: number;

    /**
     * Bộ nhớ sử dụng (MB)
     */
    @IsNumber()
    @IsOptional()
    @Prop({ default: 0.0 })
    @EntityDefinition.field({ label: "Memory Used (MB)", example: 0.0 })
    memory_used_mb?: number;

    /**
     * Số test case đã pass
     */
    @IsNumber()
    @IsOptional()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Test Cases Passed", example: 0 })
    test_cases_passed?: number;

    /**
     * Tổng số test case
     */
    @IsNumber()
    @IsOptional()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Total Test Cases", example: 0 })
    total_test_cases?: number;

    /**
     * Thời gian nộp bài trong contest
     */
    @IsDateString()
    @IsOptional()
    @Prop({ default: Date.now })
    @EntityDefinition.field({
        label: "Submitted At",
        example: "2024-01-15T10:30:00.000Z",
    })
    submitted_at?: Date;

    /**
     * Thời gian được chấm là AC
     */
    @IsDateString()
    @IsOptional()
    @Prop({ default: Date.now })
    @EntityDefinition.field({
        label: "Solved At",
        example: "2024-01-15T10:35:00.000Z",
    })
    solved_at?: Date;

    // Virtual relationships
    @EntityDefinition.field({
        label: "Contest",
        disableImport: true,
        propertyTarget: "Contests",
    })
    contest?: any;

    @EntityDefinition.field({
        label: "Submission",
        disableImport: true,
        propertyTarget: "StudentSubmissions",
    })
    submission?: any;

    @EntityDefinition.field({
        label: "Student",
        disableImport: true,
        propertyTarget: "User",
    })
    student?: any;

    @EntityDefinition.field({
        label: "Problem",
        disableImport: true,
        propertyTarget: "Problems",
    })
    problem?: any;
}

export type ContestSubmissionsDocument = HydratedDocument<ContestSubmissions>;
export const ContestSubmissionsSchema =
    SchemaFactory.createForClass(ContestSubmissions);

// Virtual relationships
ContestSubmissionsSchema.virtual("contest", {
    ref: Entity.CONTESTS,
    localField: "contest_id",
    foreignField: "_id",
    justOne: true,
});

ContestSubmissionsSchema.virtual("submission", {
    ref: Entity.STUDENT_SUBMISSIONS,
    localField: "submission_id",
    foreignField: "submission_id",
    justOne: true,
});

ContestSubmissionsSchema.virtual("student", {
    ref: Entity.USER,
    localField: "student_id",
    foreignField: "_id",
    justOne: true,
});

ContestSubmissionsSchema.virtual("problem", {
    ref: Entity.PROBLEMS,
    localField: "problem_id",
    foreignField: "_id",
    justOne: true,
});
