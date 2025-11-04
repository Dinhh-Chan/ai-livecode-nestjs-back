import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePasswordByIdDto {
    @ApiProperty({
        example: "newPassword123",
        description: "Mật khẩu mới",
    })
    @IsNotEmpty({ message: "Mật khẩu mới không được để trống" })
    @IsString({ message: "Mật khẩu mới phải là chuỗi" })
    password: string;
}
