import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsOptional, IsBoolean, IsDateString } from "class-validator";
import { HydratedDocument } from "mongoose";

@Schema({
    collection: Entity.CLASSES,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class Class implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID của lớp học
     */
    @IsString()
    @Prop({ required: true, maxlength: 50, unique: true })
    @EntityDefinition.field({ label: "ID lớp học", required: true })
    class_id: string;

    /**
     * Tên lớp học
     */
    @IsString()
    @Prop({ required: true, maxlength: 100 })
    @EntityDefinition.field({ label: "Tên lớp học", required: true })
    class_name: string;

    /**
     * Mã lớp học
     */
    @IsString()
    @Prop({ required: true, maxlength: 20 })
    @EntityDefinition.field({ label: "Mã lớp học", required: true })
    class_code: string;

    /**
     * ID khóa học
     */
    @IsString()
    @Prop({ required: true, maxlength: 50 })
    @EntityDefinition.field({ label: "ID khóa học", required: true })
    course_id: string;

    /**
     * ID giáo viên
     */
    @IsString()
    @Prop({ required: true, maxlength: 50 })
    @EntityDefinition.field({ label: "ID giáo viên", required: true })
    teacher_id: string;

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
     * Mô tả lớp học
     */
    @IsString()
    @IsOptional()
    @Prop()
    @EntityDefinition.field({ label: "Mô tả lớp học" })
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
        label: "Khóa học",
        disableImport: true,
        propertyTarget: "Courses",
    })
    course?: any;

    @EntityDefinition.field({
        label: "Giáo viên",
        disableImport: true,
        propertyTarget: "User",
    })
    teacher?: any;

    @EntityDefinition.field({
        label: "Sinh viên trong lớp",
        disableImport: true,
        propertyTarget: "CourseStudent",
    })
    students?: any[];
}

export type ClassDocument = HydratedDocument<Class>;
export const ClassSchema = SchemaFactory.createForClass(Class);

// Virtual relationships
ClassSchema.virtual("course", {
    ref: Entity.COURSES,
    localField: "course_id",
    foreignField: "course_id",
    justOne: true,
});

ClassSchema.virtual("teacher", {
    ref: Entity.USER,
    localField: "teacher_id",
    foreignField: "_id",
    justOne: true,
});

ClassSchema.virtual("students", {
    ref: Entity.COURSE_STUDENT,
    localField: "class_id",
    foreignField: "class_id",
});
