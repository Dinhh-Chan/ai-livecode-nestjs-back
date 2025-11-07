import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { FeedbackType, FeedbackStatus } from "../entities/feedback.entity";

export class CreateFeedbackDto {
    @ApiProperty({
        description: "Loại feedback (feedback hoặc error)",
        enum: FeedbackType,
        example: FeedbackType.FEEDBACK,
    })
    @IsEnum(FeedbackType)
    @IsNotEmpty({ message: "Loại feedback không được để trống" })
    type: FeedbackType;

    @ApiProperty({
        description: "Tiêu đề feedback",
        example: "Lỗi đăng nhập",
    })
    @IsString()
    @IsNotEmpty({ message: "Tiêu đề không được để trống" })
    title: string;

    @ApiProperty({
        description: "Mô tả chi tiết",
        example: "Không thể đăng nhập bằng tài khoản Google",
    })
    @IsString()
    @IsNotEmpty({ message: "Mô tả không được để trống" })
    description: string;

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
