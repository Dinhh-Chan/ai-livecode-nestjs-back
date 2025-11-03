import { IsArray, ArrayNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { ProblemItemDto } from "./problem-item.dto";

export class AddMultipleProblemsDto {
    @ApiProperty({
        description: "Danh sách problems cần thêm vào contest",
        type: [ProblemItemDto],
    })
    @IsArray()
    @ArrayNotEmpty({ message: "Danh sách problems không được để trống" })
    @ValidateNested({ each: true })
    @Type(() => ProblemItemDto)
    problems: ProblemItemDto[];
}
