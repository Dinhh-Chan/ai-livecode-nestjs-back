import { ApiProperty } from "@nestjs/swagger";
import { LanguageStatDto } from "./language-stat.dto";
import { RecentACDto } from "./recent-ac.dto";
import { SkillStatDto } from "./skill-stat.dto";

export class UserProfileDto {
    @ApiProperty({
        example: 125,
        description: "Rank của user (tính theo số bài AC)",
    })
    rank: number;

    @ApiProperty({ example: "john_doe", description: "Tên user" })
    username: string;

    @ApiProperty({ example: "John Doe", description: "Họ tên đầy đủ" })
    fullname?: string;

    @ApiProperty({
        example: { solved: 9, total: 123 },
        description: "Số bài easy AC và tổng số bài easy (độ khó 1+2)",
    })
    easy_ac: { solved: number; total: number };

    @ApiProperty({
        example: { solved: 7, total: 87 },
        description: "Số bài medium AC và tổng số bài medium (độ khó 3)",
    })
    medium_ac: { solved: number; total: number };

    @ApiProperty({
        example: { solved: 5, total: 50 },
        description: "Số bài hard AC và tổng số bài hard (độ khó 4+5)",
    })
    hard_ac: { solved: number; total: number };

    @ApiProperty({
        type: [LanguageStatDto],
        description: "Số bài AC theo từng ngôn ngữ",
    })
    languages: LanguageStatDto[];

    @ApiProperty({
        type: [RecentACDto],
        description: "Các bài gần đây được AC",
    })
    recent_ac: RecentACDto[];

    @ApiProperty({
        type: [SkillStatDto],
        description: "Skills - các subtopics có problem AC",
    })
    skills: SkillStatDto[];

    @ApiProperty({
        type: "array",
        items: {
            type: "object",
            properties: {
                date: { type: "string", example: "2025-11-12" },
                count: { type: "number", example: 5 },
            },
        },
        description:
            "Dữ liệu hoạt động theo ngày (giống GitHub heatmap) - số submission trong mỗi ngày",
        example: [
            { date: "2025-11-12", count: 5 },
            { date: "2025-11-11", count: 3 },
            { date: "2025-11-10", count: 0 },
        ],
    })
    activity_data: Array<{ date: string; count: number }>;
}
