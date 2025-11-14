import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { IsYYYYMMDD } from "@common/decorator/validate.decorator";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Auth } from "@module/auth/entities/auth.entity";
import { Entity } from "@module/repository";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Gender, SystemRole } from "../common/constant";

export class User implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * Username
     * @example username
     */
    @IsString({ message: "Tên đăng nhập phải là xâu ký tự" })
    @EntityDefinition.field({ label: "Username", required: true })
    username: string;

    /**
     * Password
     * @example password
     */
    @IsString({ message: "Mật khẩu phải là xâu ký tự" })
    @IsOptional()
    @EntityDefinition.field({ label: "Password" })
    password?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "SSO ID" })
    ssoId?: string;

    @IsEmail({}, { message: "Email không đúng định dạng" })
    @EntityDefinition.field({ label: "Email", required: true })
    email: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "First name" })
    firstname?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Last name" })
    lastname?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Full name" })
    fullname?: string;

    @IsEnum(Gender)
    @IsOptional()
    @EntityDefinition.field({
        label: "Gender",
        enum: Object.values(Gender),
        example: Gender.FEMALE,
    })
    gender?: Gender;

    /**
     * Date of birth
     * @example 1999-12-31
     */
    @IsYYYYMMDD()
    @IsOptional()
    @EntityDefinition.field({ label: "Date of birth" })
    dob?: string;

    @IsEnum(SystemRole)
    @EntityDefinition.field({
        label: "System role",
        enum: Object.values(SystemRole),
    })
    systemRole: SystemRole;

    @EntityDefinition.field({
        label: "Auth",
        disableImport: true,
        propertyTarget: Auth,
    })
    authList?: Auth[];

    @EntityDefinition.field({
        label: "Student PTIT Code",
        disableExport: true,
    })
    studentPtitCode?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Avatar URL" })
    avatarUrl?: string;

    dataPartitionCode?: string;
}
