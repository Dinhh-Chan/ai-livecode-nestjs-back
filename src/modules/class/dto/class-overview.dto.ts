/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";

export class ClassOverallStatsDto {
    @ApiProperty()
    averageDifficulty: number;

    @ApiProperty()
    completionRate: number;

    @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
    averageScoreByDifficulty: Record<string, number>;

    @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
    passRateByProblem: Record<string, number>;
}

export class TopicPerformanceDto {
    @ApiProperty()
    topicId: string;

    @ApiProperty()
    topicName: string;

    @ApiProperty()
    averageScore: number;

    @ApiProperty()
    completionRate: number;

    @ApiProperty()
    totalAttempts: number;

    @ApiProperty()
    totalSolved: number;
}

export class StudentRankingDto {
    @ApiProperty()
    studentId: string;

    @ApiProperty()
    username: string;

    @ApiProperty()
    fullname: string;

    @ApiProperty()
    totalSolved: number;

    @ApiProperty()
    averageScore: number;

    @ApiProperty()
    totalSubmissions: number;
}

export class ProblemDifficultyStatsDto {
    @ApiProperty()
    problemId: string;

    @ApiProperty()
    problemName: string;

    @ApiProperty()
    difficulty: number;

    @ApiProperty()
    failRate: number;

    @ApiProperty()
    totalAttempts: number;

    @ApiProperty()
    totalPassed: number;
}

export class ClassOverviewDto {
    @ApiProperty({ type: ClassOverallStatsDto })
    overallStats: ClassOverallStatsDto;

    @ApiProperty({ type: [TopicPerformanceDto] })
    strongTopics: TopicPerformanceDto[];

    @ApiProperty({ type: [TopicPerformanceDto] })
    weakTopics: TopicPerformanceDto[];

    @ApiProperty({ type: [StudentRankingDto] })
    topStudents: StudentRankingDto[];

    @ApiProperty({ type: [StudentRankingDto] })
    bottomStudents: StudentRankingDto[];

    @ApiProperty({ type: [ProblemDifficultyStatsDto] })
    difficultProblems: ProblemDifficultyStatsDto[];

    @ApiProperty()
    aiAnalysisKmark: string;
}
