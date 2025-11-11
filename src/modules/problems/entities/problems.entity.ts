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
    IsEnum,
    ValidateNested,
    IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import { HydratedDocument } from "mongoose";

export enum ProblemDifficulty {
    EASY = 1,
    MEDIUM = 2,
    NORMAL = 3,
    HARD = 4,
    VERY_HARD = 5,
}

export enum ProblemType {
    MULTIPLE_CHOICE_FORM = "multipleChoiceForm",
    FIX_ERROR = "fixError",
    FILL_IN_BLANK = "fillInBlank",
    COMPLETE_FUNCTION = "completeFunction",
}

export interface MultipleChoiceOption {
    no: number;
    text: string;
}

export interface MultipleChoiceForm {
    exam: MultipleChoiceOption[];
    answer: number;
}

@Schema({
    collection: Entity.PROBLEMS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class Problems implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * Topic ID - liên kết với bảng topics
     */
    @IsString()
    @IsOptional()
    @Prop({ ref: Entity.TOPICS })
    @EntityDefinition.field({ label: "Topic ID" })
    topic_id?: string;

    /**
     * Sub Topic ID - liên kết với bảng sub_topics
     */
    @IsString()
    @IsOptional()
    @Prop({ ref: Entity.SUB_TOPICS })
    @EntityDefinition.field({ label: "Sub Topic ID" })
    sub_topic_id?: string;

    /**
     * Tên bài tập
     */
    @IsString()
    @Prop({ required: true, maxlength: 200 })
    @EntityDefinition.field({ label: "Tên bài tập", required: true })
    name: string;

    /**
     * Mô tả bài tập
     */
    @IsString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Mô tả bài tập", required: true })
    description: string;

    /**
     * Mức độ khó (1-5)
     */
    @IsEnum(ProblemDifficulty)
    @Prop({ default: ProblemDifficulty.EASY })
    @EntityDefinition.field({
        label: "Mức độ khó",
        enum: Object.values(ProblemDifficulty),
        example: ProblemDifficulty.EASY,
    })
    difficulty: ProblemDifficulty;

    /**
     * Template code
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Template code" })
    code_template?: string;

    /**
     * Hướng dẫn giải
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Hướng dẫn giải" })
    guidelines?: string;

    /**
     * Lời giải
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Lời giải" })
    solution?: string;

    /**
     * Giới hạn thời gian (ms)
     */
    @IsNumber()
    @Prop({ default: 1000 })
    @EntityDefinition.field({ label: "Giới hạn thời gian (ms)" })
    time_limit_ms: number;

    /**
     * Giới hạn bộ nhớ (MB)
     */
    @IsNumber()
    @Prop({ default: 512 })
    @EntityDefinition.field({ label: "Giới hạn bộ nhớ (MB)" })
    memory_limit_mb: number;

    /**
     * Số lượng test case
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Số lượng test case" })
    number_of_tests: number;

    /**
     * Bài tập công khai hay riêng tư
     */
    @IsBoolean()
    @Prop({ default: true })
    @EntityDefinition.field({ label: "Bài tập công khai" })
    is_public: boolean;

    /**
     * Trạng thái hoạt động
     */
    @IsBoolean()
    @Prop({ default: true })
    @EntityDefinition.field({ label: "Trạng thái hoạt động" })
    is_active: boolean;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Topic",
        disableImport: true,
        propertyTarget: "Topics",
    })
    topic?: any;

    @EntityDefinition.field({
        label: "Sub Topic",
        disableImport: true,
        propertyTarget: "SubTopics",
    })
    sub_topic?: any;

    @EntityDefinition.field({
        label: "Test Cases",
        disableImport: true,
        propertyTarget: "TestCases",
    })
    test_cases?: any[];
    /**
     * Sets - tập hợp dữ liệu
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Sets" })
    sets?: string;

    /**
     * Steps - các bước thực hiện
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Steps" })
    steps?: string;

    /**
     * Loại bài tập
     */
    @IsEnum(ProblemType)
    @IsOptional()
    @Prop({ default: ProblemType.COMPLETE_FUNCTION })
    @EntityDefinition.field({
        label: "Loại bài tập",
        enum: Object.values(ProblemType),
        example: ProblemType.COMPLETE_FUNCTION,
    })
    problem_type?: ProblemType;

    /**
     * Form trắc nghiệm (chỉ dùng khi problem_type = multipleChoiceForm)
     */
    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => Object)
    @Prop({ type: Object })
    @EntityDefinition.field({
        label: "Form trắc nghiệm",
    })
    multipleChoiceForm?: MultipleChoiceForm | false;
}

export type ProblemsDocument = HydratedDocument<Problems>;
export const ProblemsSchema = SchemaFactory.createForClass(Problems);

// Virtual relationships
ProblemsSchema.virtual("topic", {
    ref: Entity.TOPICS,
    localField: "topic_id",
    foreignField: "_id",
    justOne: true,
});

ProblemsSchema.virtual("sub_topic", {
    ref: Entity.SUB_TOPICS,
    localField: "sub_topic_id",
    foreignField: "_id",
    justOne: true,
});

ProblemsSchema.virtual("test_cases", {
    ref: Entity.TEST_CASES,
    localField: "_id",
    foreignField: "problem_id",
});
