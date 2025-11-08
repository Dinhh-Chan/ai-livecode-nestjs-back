import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateSessionDto {
    @ApiProperty({
        description: "Tên phiên chat",
        example: "Chat về bài toán DFS",
    })
    @IsString()
    @IsNotEmpty({ message: "Tên phiên chat không được để trống" })
    session_name: string;

    @ApiProperty({
        description: "ID của đề bài",
        example: "507f1f77bcf86cd799439011",
        required: false,
    })
    @IsString()
    @IsOptional()
    question_id?: string;

    @ApiProperty({
        description: "Nội dung đề bài",
        example: "Tìm đường đi ngắn nhất trong đồ thị",
        required: false,
    })
    @IsString()
    @IsOptional()
    question_content?: string;
}
