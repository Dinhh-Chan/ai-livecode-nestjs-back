import { IsString, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum TeacherRole {
    MAIN = "main",
    ASSISTANT = "assistant",
    GUEST = "guest",
}

export class AssignTeacherDto {
    @ApiProperty({ description: "ID của giáo viên" })
    @IsString()
    teacherId: string;

    @ApiProperty({
        description: "Vai trò của giáo viên",
        enum: TeacherRole,
        default: TeacherRole.MAIN,
    })
    @IsEnum(TeacherRole)
    @IsOptional()
    role?: TeacherRole;
}
