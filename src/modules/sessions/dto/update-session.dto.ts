import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateSessionDto {
    @ApiProperty({
        description: "Tên phiên chat",
        example: "Chat về bài toán DFS",
        required: false,
    })
    @IsString()
    @IsOptional()
    session_name?: string;

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
