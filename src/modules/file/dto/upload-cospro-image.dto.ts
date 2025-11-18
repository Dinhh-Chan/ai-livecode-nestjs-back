import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MaxLength } from "class-validator";

export class UploadCosproImageDto {
    @ApiProperty({
        description:
            "Tên file mong muốn. Chỉ chấp nhận ký tự chữ, số, dấu chấm, gạch ngang và gạch dưới",
        example: "ketqua-bai1.png",
    })
    @IsString()
    @MaxLength(255)
    @Matches(/^[a-zA-Z0-9._-]+$/, {
        message: "Tên file chỉ được chứa chữ, số, '.', '-' và '_'",
    })
    filename: string;
}
