import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { MessageRole } from "../entities/messages.entity";

export class CreateMessageDto {
    @ApiProperty({
        description: "ID của session",
        example: "507f1f77bcf86cd799439011",
    })
    @IsString()
    @IsNotEmpty({ message: "ID session không được để trống" })
    session_id: string;

    @ApiProperty({
        description: "Vai trò người gửi (user hoặc assistant)",
        enum: MessageRole,
        example: MessageRole.USER,
    })
    @IsEnum(MessageRole)
    @IsNotEmpty({ message: "Vai trò không được để trống" })
    role: MessageRole;

    @ApiProperty({
        description: "Nội dung tin nhắn",
        example: "Xin chào, tôi cần giúp đỡ về bài toán này",
    })
    @IsString()
    @IsNotEmpty({ message: "Nội dung tin nhắn không được để trống" })
    content: string;
}
