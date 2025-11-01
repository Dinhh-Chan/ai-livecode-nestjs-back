import { ApiProperty } from "@nestjs/swagger";

export class SkillStatDto {
    @ApiProperty({
        example: "64f1234567890abcdef12345",
        description: "Sub Topic ID",
    })
    sub_topic_id: string;

    @ApiProperty({ example: "math", description: "Tên subtopic" })
    sub_topic_name: string;

    @ApiProperty({ example: 7, description: "Số bài đã AC trong subtopic này" })
    problems_solved: number;
}
