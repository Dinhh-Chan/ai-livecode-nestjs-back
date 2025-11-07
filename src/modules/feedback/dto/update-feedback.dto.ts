import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum } from "class-validator";
import { FeedbackType, FeedbackStatus } from "../entities/feedback.entity";

export class UpdateFeedbackDto {
    @ApiProperty({
        description: "Loại feedback (feedback hoặc error)",
        enum: FeedbackType,
        example: FeedbackType.FEEDBACK,
        required: false,
    })
    @IsEnum(FeedbackType)
    @IsOptional()
    type?: FeedbackType;

    @ApiProperty({
        description: "Tiêu đề feedback",
        example: "Lỗi đăng nhập",
        required: false,
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({
        description: "Mô tả chi tiết",
        example: "Không thể đăng nhập bằng tài khoản Google",
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: "Trạng thái xử lý",
        enum: FeedbackStatus,
        example: FeedbackStatus.PENDING,
        required: false,
    })
    @IsEnum(FeedbackStatus)
    @IsOptional()
    status?: FeedbackStatus;

    @ApiProperty({
        description: "Ghi chú từ admin",
        example: "Đã xử lý xong",
        required: false,
    })
    @IsString()
    @IsOptional()
    admin_note?: string;

    @ApiProperty({
        description: "URL hình ảnh đính kèm",
        example: "/public/feedback-images/1234567890_image.jpg",
        required: false,
    })
    @IsString()
    @IsOptional()
    image_url?: string;
}
