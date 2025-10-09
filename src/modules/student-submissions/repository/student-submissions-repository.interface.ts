import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { StudentSubmissions } from "../entities/student-submissions.entity";
import {
    SubmissionStatus,
    ProgrammingLanguage,
} from "../entities/student-submissions.entity";

export interface StudentSubmissionsRepository
    extends BaseRepository<StudentSubmissions> {
    // Các method custom cho StudentSubmissions
    findByStudentId(
        studentId: string,
        limit?: number,
    ): Promise<StudentSubmissions[]>;
    findByProblemId(
        problemId: string,
        limit?: number,
    ): Promise<StudentSubmissions[]>;
    findByClassId(
        classId: string,
        limit?: number,
    ): Promise<StudentSubmissions[]>;
    findByStatus(
        status: SubmissionStatus,
        limit?: number,
    ): Promise<StudentSubmissions[]>;
    findByJudgeNodeId(
        judgeNodeId: string,
        limit?: number,
    ): Promise<StudentSubmissions[]>;
    findByStudentAndProblem(
        studentId: string,
        problemId: string,
        limit?: number,
    ): Promise<StudentSubmissions[]>;
    getStudentSubmissionStats(studentId: string): Promise<{
        totalSubmissions: number;
        acceptedSubmissions: number;
        statusCounts: Record<string, number>;
        averageScore: number;
        lastSubmission: Date | null;
    }>;
    getProblemSubmissionStats(problemId: string): Promise<{
        totalSubmissions: number;
        acceptedSubmissions: number;
        statusCounts: Record<string, number>;
        averageScore: number;
        languageCounts: Record<string, number>;
    }>;
    getPendingSubmissions(limit?: number): Promise<StudentSubmissions[]>;
    getRunningSubmissions(limit?: number): Promise<StudentSubmissions[]>;
    updateSubmissionStatus(
        submissionId: string,
        status: SubmissionStatus,
        additionalData?: any,
    ): Promise<StudentSubmissions>;
    getSubmissionsByTimeRange(
        startDate: Date,
        endDate: Date,
        limit?: number,
    ): Promise<StudentSubmissions[]>;
}
