import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsDateString,
    IsEnum,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { SubmissionStatus } from "@module/student-submissions/entities/student-submissions.entity";

export class CreateContestSubmissionsDto {
    @IsString()
    @IsNotEmpty({ message: "Contest ID không được để trống" })
    @EntityDefinition.field({ label: "Contest ID", required: true })
    contest_id: string;

    @IsString()
    @IsNotEmpty({ message: "Submission ID không được để trống" })
    @EntityDefinition.field({ label: "Submission ID", required: true })
    submission_id: string;

    @IsString()
    @IsNotEmpty({ message: "Student ID không được để trống" })
    @EntityDefinition.field({ label: "Student ID", required: true })
    student_id: string;

    @IsString()
    @IsNotEmpty({ message: "Problem ID không được để trống" })
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    @IsString()
    @IsNotEmpty({ message: "Code không được để trống" })
    @EntityDefinition.field({ label: "Source Code", required: true })
    code: string;

    @IsNumber()
    @IsNotEmpty({ message: "Language ID không được để trống" })
    @EntityDefinition.field({
        label: "Programming Language ID",
        example: 71,
        required: true,
    })
    language_id: number;

    @IsEnum(SubmissionStatus)
    @IsOptional()
    @EntityDefinition.field({
        label: "Submission Status",
        enum: Object.values(SubmissionStatus),
        example: SubmissionStatus.ACCEPTED,
    })
    status?: SubmissionStatus;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Score", example: 100.0 })
    score?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Execution Time (ms)", example: 0 })
    execution_time_ms?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Memory Used (MB)", example: 0.0 })
    memory_used_mb?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Test Cases Passed", example: 0 })
    test_cases_passed?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Total Test Cases", example: 0 })
    total_test_cases?: number;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({
        label: "Submitted At",
        example: "2024-01-15T10:30:00.000Z",
    })
    submitted_at?: Date;

    @IsDateString()
    @IsOptional()
    @EntityDefinition.field({
        label: "Solved At",
        example: "2024-01-15T10:35:00.000Z",
    })
    solved_at?: Date;
}
