import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsNumber, IsDecimal } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.TEST_CASE_RESULTS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class TestCaseResults implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID kết quả test case
     */
    @IsString()
    @Prop({ required: true, unique: true, maxlength: 50 })
    @EntityDefinition.field({ label: "ID kết quả test case", required: true })
    result_id: string;

    /**
     * ID submission của học sinh
     */
    @IsString()
    @Prop({ required: true, maxlength: 50 })
    @EntityDefinition.field({
        label: "ID submission của học sinh",
        required: true,
    })
    submission_id: string;

    /**
     * ID test case
     */
    @IsString()
    @Prop({ required: true, maxlength: 50 })
    @EntityDefinition.field({ label: "ID test case", required: true })
    test_case_id: string;

    /**
     * Trạng thái test case (passed | failed | error)
     */
    @IsString()
    @Prop({ required: true, maxlength: 20 })
    @EntityDefinition.field({ label: "Trạng thái test case", required: true })
    status: string;

    /**
     * Kết quả thực tế
     */
    @IsString()
    @IsOptional()
    @Prop({ type: String })
    @EntityDefinition.field({ label: "Kết quả thực tế" })
    actual_output?: string;

    /**
     * Thời gian thực thi (ms)
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Thời gian thực thi (ms)" })
    execution_time_ms: number;

    /**
     * Bộ nhớ sử dụng (MB)
     */
    @IsDecimal()
    @Prop({ default: 0.0 })
    @EntityDefinition.field({ label: "Bộ nhớ sử dụng (MB)" })
    memory_used_mb: number;

    /**
     * Thông báo lỗi
     */
    @IsString()
    @IsOptional()
    @Prop({ type: String })
    @EntityDefinition.field({ label: "Thông báo lỗi" })
    error_message?: string;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Student Submission",
        disableImport: true,
        propertyTarget: "StudentSubmissions",
    })
    student_submission?: any;

    @EntityDefinition.field({
        label: "Test Case",
        disableImport: true,
        propertyTarget: "TestCases",
    })
    test_case?: any;
}

export type TestCaseResultsDocument = HydratedDocument<TestCaseResults>;
export const TestCaseResultsSchema =
    SchemaFactory.createForClass(TestCaseResults);

// Virtual relationships
TestCaseResultsSchema.virtual("student_submission", {
    ref: Entity.STUDENT_SUBMISSIONS,
    localField: "submission_id",
    foreignField: "submission_id",
});

TestCaseResultsSchema.virtual("test_case", {
    ref: Entity.TEST_CASES,
    localField: "test_case_id",
    foreignField: "test_case_id",
});
