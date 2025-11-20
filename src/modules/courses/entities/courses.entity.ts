import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { IsString, IsOptional, IsBoolean } from "class-validator";

export class Courses implements BaseEntity {
    _id: string;

    /**
     * Tên khóa học
     */
    @IsString()
    @EntityDefinition.field({ label: "Tên khóa học", required: true })
    course_name: string;

    /**
     * Mã khóa học
     */
    @IsString()
    @EntityDefinition.field({ label: "Mã khóa học", required: true })
    course_code: string;

    /**
     * Mô tả khóa học
     */
    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Mô tả khóa học" })
    description?: string;

    /**
     * Trạng thái hoạt động
     */
    @IsBoolean()
    @EntityDefinition.field({ label: "Trạng thái hoạt động" })
    is_active: boolean;

    /**
     * Khóa học công khai hay riêng tư
     */
    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Khóa học công khai" })
    is_public?: boolean;

    createdAt?: Date;
    updatedAt?: Date;

    // Virtual relationships
    @EntityDefinition.field({
        label: "Học viên",
        disableImport: true,
        propertyTarget: "User",
    })
    students?: any[];

    @EntityDefinition.field({
        label: "Giáo viên",
        disableImport: true,
        propertyTarget: "User",
    })
    teachers?: any[];
}
