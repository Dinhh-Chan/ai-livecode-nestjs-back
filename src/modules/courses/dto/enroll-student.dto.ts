import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class EnrollStudentDto {
    @ApiProperty({ description: "ID của học viên" })
    @IsString()
    studentId: string;
}
