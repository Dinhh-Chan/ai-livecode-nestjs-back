import { ApiProperty } from "@nestjs/swagger";

export class UserRecordDto {
    @ApiProperty({ description: "ID của người dùng" })
    _id: string;

    @ApiProperty({ description: "Tên đăng nhập" })
    username: string;

    @ApiProperty({ description: "Email" })
    email: string;

    @ApiProperty({ description: "Họ và tên", required: false })
    fullName?: string;

    @ApiProperty({ description: "Avatar URL", required: false })
    avatar?: string;

    @ApiProperty({ description: "Vai trò hệ thống" })
    systemRole: string;

    @ApiProperty({ description: "Thời gian tạo" })
    createdAt: Date;

    @ApiProperty({ description: "Thời gian cập nhật" })
    updatedAt: Date;
}
