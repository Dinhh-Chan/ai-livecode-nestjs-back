import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum } from "class-validator";
import { MessageRole } from "../entities/messages.entity";

export class UpdateMessageDto {
    @ApiProperty({
        description: "ID của session",
        example: "507f1f77bcf86cd799439011",
        required: false,
    })
    @IsString()
    @IsOptional()
    session_id?: string;

    @ApiProperty({
        description: "Vai trò người gửi (user hoặc assistant)",
        enum: MessageRole,
        example: MessageRole.USER,
        required: false,
    })
    @IsEnum(MessageRole)
    @IsOptional()
    role?: MessageRole;

    @ApiProperty({
        description: "Nội dung tin nhắn",
        example: "Xin chào, tôi cần giúp đỡ về bài toán này",
        required: false,
    })
    @IsString()
    @IsOptional()
    content?: string;
}
