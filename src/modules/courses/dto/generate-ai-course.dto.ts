/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEnum } from "class-validator";

export enum LearningGoal {
    INTERVIEW = "interview",
    ICPC_CONTEST = "icpc_contest",
    UNDERSTAND_ALGORITHM = "understand_algorithm",
    CAREER_CHANGE = "career_change",
    REINFORCE_OOP_DSA = "reinforce_oop_dsa",
}

export class GenerateAiCourseDto {
    @ApiProperty({
        enum: LearningGoal,
        description: "Mục tiêu học tập",
        example: LearningGoal.INTERVIEW,
    })
    @IsEnum(LearningGoal)
    learning_goal: LearningGoal;

    @ApiProperty({
        description: "Ghi chú thêm cho AI",
        required: false,
        example: "Tôi muốn tập trung vào các bài toán về mảng và chuỗi",
    })
    @IsString()
    @IsOptional()
    additional_notes?: string;
}

export class LearningPathStepDto {
    @ApiProperty()
    step_number: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ type: [String] })
    recommended_problems: string[];

    @ApiProperty({ type: [String] })
    topics_to_focus: string[];

    @ApiProperty()
    estimated_time: string;
}

export class AdviceDto {
    @ApiProperty()
    general_advice: string;

    @ApiProperty({ type: [String] })
    strengths_to_leverage: string[];

    @ApiProperty({ type: [String] })
    weaknesses_to_improve: string[];

    @ApiProperty({ type: [String] })
    study_tips: string[];
}

export class ProblemInfoDto {
    @ApiProperty()
    problem_id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    difficulty: number;

    @ApiProperty()
    topic_name?: string;

    @ApiProperty()
    sub_topic_name?: string;
}

export class GeneratedCourseDto {
    @ApiProperty()
    course_id: string;

    @ApiProperty()
    course_name: string;

    @ApiProperty()
    course_code: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    is_public: boolean;

    @ApiProperty({ type: [String] })
    problem_ids: string[];

    @ApiProperty({ type: [ProblemInfoDto] })
    problems: ProblemInfoDto[];

    @ApiProperty({ type: AdviceDto })
    advice: AdviceDto;

    @ApiProperty()
    user_assessment: string;

    @ApiProperty({ type: [LearningPathStepDto] })
    learning_path: LearningPathStepDto[];

    @ApiProperty()
    summary: string;

    @ApiProperty()
    estimated_total_time: string;
}
