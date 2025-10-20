import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SelfEnrollDto {
    @ApiProperty({ description: "Mã khóa học để xác thực", required: false })
    @IsString()
    @IsOptional()
    courseCode?: string;
}
