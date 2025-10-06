import { IsString, IsNotEmpty, IsBoolean } from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateOrganizationDto {
    @IsString()
    @IsNotEmpty({ message: "Mã tổ chức không được để trống" })
    @EntityDefinition.field({ label: "Mã tổ chức", required: true })
    organId: string;

    @IsString()
    @IsNotEmpty({ message: "SS ID không được để trống" })
    @EntityDefinition.field({ label: "SS ID", required: true })
    ssId: string;

    @IsString()
    @IsNotEmpty({ message: "Tên tổ chức không được để trống" })
    @EntityDefinition.field({ label: "Tên tổ chức", required: true })
    organName: string;

    @IsString()
    @IsNotEmpty({ message: "Tổ chức phụ trách không được để trống" })
    @EntityDefinition.field({ label: "Tổ chức phụ trách", required: true })
    organizationInCharge?: string;

    @IsString()
    @IsNotEmpty({ message: "Địa chỉ tổ chức không được để trống" })
    @EntityDefinition.field({ label: "Địa chỉ tổ chức", required: true })
    organAdd?: string;

    @IsNotEmpty({ message: "Email không được để trống" })
    @EntityDefinition.field({ label: "Email", required: true })
    email?: string;

    @IsString()
    @IsNotEmpty({ message: "Số điện thoại không được để trống" })
    @EntityDefinition.field({ label: "Số điện thoại", required: true })
    telephone?: string;

    @IsString()
    @IsNotEmpty({ message: "Số fax không được để trống" })
    @EntityDefinition.field({ label: "Số fax", required: true })
    fax?: string;

    @IsString()
    @IsNotEmpty({ message: "Website không được để trống" })
    @EntityDefinition.field({ label: "Website", required: true })
    website?: string;

    @IsBoolean()
    @IsNotEmpty({ message: "Tổ chức bên ngoài không được để trống" })
    @EntityDefinition.field({ label: "Tổ chức bên ngoài", required: true })
    isExternal?: boolean;

    @IsString()
    @IsNotEmpty({ message: "Mô tả không được để trống" })
    @EntityDefinition.field({ label: "Mô tả", required: true })
    description?: string;

    @IsString()
    @IsNotEmpty({ message: "Trạng thái không được để trống" })
    @EntityDefinition.field({ label: "Trạng thái", required: true })
    status?: string;
}
