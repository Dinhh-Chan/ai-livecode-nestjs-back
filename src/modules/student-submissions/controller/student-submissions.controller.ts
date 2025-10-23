import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { StudentSubmissionsService } from "../services/student-submissions.services";
import { StudentSubmissions } from "../entities/student-submissions.entity";
import { CreateStudentSubmissionsDto } from "../dto/create-student-submissions.dto";
import { UpdateStudentSubmissionsDto } from "../dto/update-student-submissions.dto";
import { Controller, Post, Get, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { ConditionStudentSubmissionsDto } from "../dto/condition-student-submissions.dto";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { ReqUser } from "@common/decorator/auth.decorator";
import { SubmitCodeDto } from "../dto/submit-code.dto";
import { SubmissionResponseDto } from "../dto/submission-response.dto";
import { RankingResponseDto } from "../dto/ranking-response.dto";
import { RankingRecordDto } from "../dto/ranking-record.dto";
import { GetManyQuery } from "@common/constant";
import {
    RequestCondition,
    RequestQuery,
} from "@common/decorator/query.decorator";
import { ApiListResponse } from "@common/decorator/api.decorator";
import { AllowSystemRoles } from "@common/decorator/auth.decorator";

@Controller("student-submissions")
@ApiTags("Student Submissions")
export class StudentSubmissionsController extends BaseControllerFactory<StudentSubmissions>(
    StudentSubmissions,
    ConditionStudentSubmissionsDto,
    CreateStudentSubmissionsDto,
    UpdateStudentSubmissionsDto,
    {
        authorize: true,
        routes: {
            getById: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            getMany: {
                enable: false, // Disable để tránh xung đột với route custom
            },
            getPage: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            create: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            updateById: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            deleteById: {
                roles: [SystemRole.ADMIN],
            },
        },
    },
) {
    constructor(
        private readonly studentSubmissionsService: StudentSubmissionsService,
    ) {
        super(studentSubmissionsService);
    }

    @Get("many")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({
        summary: "Lấy danh sách submissions với thông tin problem và student",
    })
    @ApiListResponse(StudentSubmissions)
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionStudentSubmissionsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<StudentSubmissions>,
    ) {
        return this.studentSubmissionsService.getMany(user, conditions, query);
    }

    @Post("submit")
    @ApiOperation({ summary: "Submit code đến Judge0 và chấm bài" })
    @ApiResponse({
        status: 201,
        description: "Submit thành công",
        type: SubmissionResponseDto,
    })
    async submitCode(
        @ReqUser() user: User,
        @Body() dto: SubmitCodeDto,
    ): Promise<SubmissionResponseDto> {
        const submission = await this.studentSubmissionsService.submitCode(
            user,
            dto,
        );
        return submission as SubmissionResponseDto;
    }

    @Get("my-submissions")
    @ApiOperation({ summary: "Lấy danh sách submissions của tôi" })
    @ApiResponse({
        status: 200,
        description: "Danh sách submissions",
        type: [SubmissionResponseDto],
    })
    async getMySubmissions(
        @ReqUser() user: User,
    ): Promise<SubmissionResponseDto[]> {
        const submissions =
            await this.studentSubmissionsService.getSubmissionsByStudent(
                user,
                user._id,
            );
        return submissions as SubmissionResponseDto[];
    }

    @Get("ranking")
    @ApiOperation({ summary: "Lấy bảng xếp hạng theo số bài đã giải" })
    @ApiQuery({
        name: "limit",
        required: false,
        type: Number,
        description: "Số lượng người dùng trong bảng xếp hạng (mặc định: 100)",
        example: 50,
    })
    @ApiQuery({
        name: "includeCurrentUser",
        required: false,
        type: Boolean,
        description:
            "Có bao gồm thứ hạng của người dùng hiện tại không (mặc định: true)",
        example: true,
    })
    @ApiResponse({
        status: 200,
        description: "Bảng xếp hạng thành công",
        type: [RankingRecordDto],
    })
    async getRanking(
        @ReqUser() user: User,
        @Query("limit") limit?: number,
        @Query("includeCurrentUser") includeCurrentUser?: boolean,
    ): Promise<RankingRecordDto[]> {
        const rankingLimit = limit || 100;
        const includeUser = includeCurrentUser !== false; // Mặc định là true

        const rankings = await this.studentSubmissionsService.getRanking(
            user,
            rankingLimit,
            includeUser,
        );

        return rankings as unknown as RankingRecordDto[];
    }

    @Get("stats/my-stats")
    @ApiOperation({ summary: "Lấy thống kê submissions của tôi" })
    @ApiResponse({
        status: 200,
        description: "Thống kê submissions",
    })
    async getMyStats(@ReqUser() user: User) {
        return this.studentSubmissionsService.getStudentSubmissionStats(
            user._id,
        );
    }

    @Get("stats/problem/:problemId")
    @ApiOperation({ summary: "Lấy thống kê submissions của một bài tập" })
    @ApiResponse({
        status: 200,
        description: "Thống kê submissions",
    })
    async getProblemStats(
        @ReqUser() user: User,
        @Param("problemId") problemId: string,
    ) {
        return this.studentSubmissionsService.getProblemSubmissionStats(
            problemId,
        );
    }

    @Get("problem/:problemId/submissions")
    @ApiOperation({
        summary: "Lấy danh sách submissions của tôi cho một bài tập cụ thể",
    })
    @ApiResponse({
        status: 200,
        description: "Danh sách submissions của user hiện tại cho bài tập",
        type: [SubmissionResponseDto],
    })
    async getProblemSubmissions(
        @ReqUser() user: User,
        @Param("problemId") problemId: string,
    ): Promise<SubmissionResponseDto[]> {
        const submissions =
            await this.studentSubmissionsService.getSubmissionsByProblem(
                user,
                problemId,
            );
        return submissions as SubmissionResponseDto[];
    }

    @Get("student/:studentId/submissions")
    @ApiOperation({ summary: "Lấy danh sách submissions của một sinh viên" })
    @ApiResponse({
        status: 200,
        description: "Danh sách submissions",
        type: [SubmissionResponseDto],
    })
    async getStudentSubmissions(
        @ReqUser() user: User,
        @Param("studentId") studentId: string,
    ): Promise<SubmissionResponseDto[]> {
        const submissions =
            await this.studentSubmissionsService.getSubmissionsByStudent(
                user,
                studentId,
            );
        return submissions as SubmissionResponseDto[];
    }

    @Get(":submissionId/result")
    @ApiOperation({ summary: "Lấy kết quả submission từ Judge0" })
    @ApiResponse({
        status: 200,
        description: "Kết quả submission",
        type: SubmissionResponseDto,
    })
    async getSubmissionResult(
        @ReqUser() user: User,
        @Param("submissionId") submissionId: string,
    ): Promise<SubmissionResponseDto> {
        const submission =
            await this.studentSubmissionsService.getSubmissionResult(
                user,
                submissionId,
            );
        return submission as SubmissionResponseDto;
    }

    @Get(":submissionId")
    @ApiOperation({ summary: "Lấy thông tin submission theo ID" })
    @ApiResponse({
        status: 200,
        description: "Thông tin submission với problem details",
        type: SubmissionResponseDto,
    })
    async getSubmissionById(
        @ReqUser() user: User,
        @Param("submissionId") submissionId: string,
    ): Promise<SubmissionResponseDto> {
        const submission = await this.studentSubmissionsService.getById(
            user,
            submissionId,
        );
        return submission as SubmissionResponseDto;
    }
}
