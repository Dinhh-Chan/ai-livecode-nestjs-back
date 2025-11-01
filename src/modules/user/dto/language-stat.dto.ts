import { ApiProperty } from "@nestjs/swagger";

export class LanguageStatDto {
    @ApiProperty({ example: "python", description: "Tên ngôn ngữ" })
    language: string;

    @ApiProperty({ example: 37, description: "Số bài đã AC bằng ngôn ngữ này" })
    problems_solved: number;
}
