import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsBoolean, IsDateString } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.CLASS_STUDENTS,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class ClassStudents implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID của class student
     */
    @IsString()
    @Prop({ required: true, maxlength: 50, unique: true })
    @EntityDefinition.field({ label: "ID class student", required: true })
    class_student_id: string;

    /**
     * ID của lớp học
     */
    @IsString()
    @Prop({ required: true, maxlength: 50 })
    @EntityDefinition.field({ label: "ID lớp học", required: true })
    class_id: string;

    /**
     * ID của sinh viên
     */
    @IsString()
    @Prop({ required: true, maxlength: 50 })
    @EntityDefinition.field({ label: "ID sinh viên", required: true })
    student_id: string;

    /**
     * Thời gian đăng ký
     */
    @IsDateString()
    @Prop({ default: Date.now })
    @EntityDefinition.field({ label: "Thời gian đăng ký" })
    enrolled_at: Date;

    /**
     * Trạng thái hoạt động
     */
    @IsBoolean()
    @Prop({ default: true })
    @EntityDefinition.field({ label: "Trạng thái hoạt động" })
    is_active: boolean;

    // Virtual fields for relationships
    @EntityDefinition.field({
        label: "Lớp học",
        disableImport: true,
        propertyTarget: "Class",
    })
    class?: any;

    @EntityDefinition.field({
        label: "Sinh viên",
        disableImport: true,
        propertyTarget: "User",
    })
    student?: any;
}

export type ClassStudentsDocument = HydratedDocument<ClassStudents>;
export const ClassStudentsSchema = SchemaFactory.createForClass(ClassStudents);

// Virtual relationships
ClassStudentsSchema.virtual("class", {
    ref: Entity.CLASSES,
    localField: "class_id",
    foreignField: "class_id",
    justOne: true,
});

ClassStudentsSchema.virtual("student", {
    ref: Entity.USER,
    localField: "student_id",
    foreignField: "_id",
    justOne: true,
});

// Index for unique constraint
ClassStudentsSchema.index({ class_id: 1, student_id: 1 }, { unique: true });
