/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";

export class TopicStatDto {
    @ApiProperty()
    topicId?: string;

    @ApiProperty()
    topicName: string;

    @ApiProperty()
    attempts: number;

    @ApiProperty()
    solved: number;

    @ApiProperty()
    accuracy: number;

    @ApiProperty()
    averageDifficulty: number;

    @ApiProperty({ required: false })
    averageTimeToAcMs?: number | null;
}

export class OverviewLayer1Dto {
    @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
    solvedByDifficulty: Record<string, number>;

    @ApiProperty()
    accuracy: number;

    @ApiProperty()
    averageTimeToAcMs: number | null;

    @ApiProperty()
    averageSubmissionsPerProblem: number;

    @ApiProperty({ type: [TopicStatDto] })
    topTopics: TopicStatDto[];

    @ApiProperty({ type: [TopicStatDto] })
    lowTopics: TopicStatDto[];
}

export class OverviewLayer2Dto {
    @ApiProperty({ type: [TopicStatDto] })
    strengthTopics: TopicStatDto[];

    @ApiProperty({ type: [TopicStatDto] })
    weakTopics: TopicStatDto[];

    @ApiProperty({ type: [TopicStatDto] })
    focusTopics: TopicStatDto[];

    @ApiProperty()
    summaryKmark: string;
}

export class OverviewLayer3Dto {
    @ApiProperty()
    aiKmark: string;

    @ApiProperty()
    usedModel?: string;
}

export class UserOverviewDto {
    @ApiProperty({ type: OverviewLayer1Dto })
    layer1: OverviewLayer1Dto;

    @ApiProperty({ type: OverviewLayer2Dto })
    layer2: OverviewLayer2Dto;

    @ApiProperty({ type: OverviewLayer3Dto })
    layer3: OverviewLayer3Dto;
}
