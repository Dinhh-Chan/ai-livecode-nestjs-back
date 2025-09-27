import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.TEST_CASES,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class TestCases implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * Problem ID - liên kết với bảng problems
     */
    @IsString()
    @Prop({ required: true, ref: Entity.PROBLEMS })
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    /**
     * Dữ liệu đầu vào
     */
    @IsString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Dữ liệu đầu vào", required: true })
    input_data: string;

    /**
     * Kết quả mong đợi
     */
    @IsString()
    @Prop({ required: true })
    @EntityDefinition.field({ label: "Kết quả mong đợi", required: true })
    expected_output: string;

    /**
     * Test case công khai hay ẩn
     */
    @IsBoolean()
    @Prop({ default: true })
    @EntityDefinition.field({ label: "Test case công khai" })
    is_public: boolean;

    /**
     * Thứ tự sắp xếp
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Thứ tự sắp xếp" })
    order_index: number;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Problem",
        disableImport: true,
        propertyTarget: "Problems"
    })
    problem?: any;
}

export type TestCasesDocument = HydratedDocument<TestCases>;
export const TestCasesSchema = SchemaFactory.createForClass(TestCases);

// Virtual relationships
TestCasesSchema.virtual("problem", {
    ref: Entity.PROBLEMS,
    localField: "problem_id",
    foreignField: "_id",
    justOne: true
});
