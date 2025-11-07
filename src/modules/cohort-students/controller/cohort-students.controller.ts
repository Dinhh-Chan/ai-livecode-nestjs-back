import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { CohortStudentsService } from "../services/cohort-students.services";
import { CohortStudents } from "../entities/cohort-students.entity";
import { CreateCohortStudentsDto } from "../dto/create-cohort-students.dto";
import { UpdateCohortStudentsDto } from "../dto/update-cohort-students.dto";
import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionCohortStudentsDto } from "../dto/condition-cohort-students.dto";
import { GetManyQuery } from "@common/constant";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { ApiListResponse } from "@common/decorator/api.decorator";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";
import { AddMultipleCohortStudentsDto } from "../dto/add-multiple-cohort-students.dto";

@Controller("cohort-students")
@ApiTags("Cohort Students")
export class CohortStudentsController extends BaseControllerFactory<CohortStudents>(
    CohortStudents,
    ConditionCohortStudentsDto,
    CreateCohortStudentsDto,
    UpdateCohortStudentsDto,
) {
    constructor(private readonly cohortStudentsService: CohortStudentsService) {
        super(cohortStudentsService);
    }

    @Get("many")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({ summary: "Lấy danh sách sinh viên trong khóa học" })
    @ApiListResponse(CohortStudents)
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionCohortStudentsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<CohortStudents>,
    ) {
        return this.cohortStudentsService.getMany(user, conditions, query);
    }

    @Get("by-cohort/:cohortId")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({
        summary: "Lấy danh sách sinh viên theo cohort ID",
        description:
            "API để lấy danh sách tất cả sinh viên trong một khóa học cụ thể",
    })
    @ApiParam({
        name: "cohortId",
        description: "ID của khóa học",
        type: String,
        example: "507f1f77bcf86cd799439011",
    })
    @ApiQuery({
        name: "select",
        required: false,
        description: "Các trường cần lấy",
        type: String,
        example: "_id,cohort_student_id,student_id,enrolled_at,is_active",
    })
    @ApiQuery({
        name: "sort",
        required: false,
        description: "Sắp xếp theo trường",
        type: String,
        example: "enrolled_at",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng bản ghi tối đa",
        type: Number,
        example: 10,
    })
    @ApiQuery({
        name: "skip",
        required: false,
        description: "Số lượng bản ghi bỏ qua",
        type: Number,
        example: 0,
    })
    @ApiListResponse(CohortStudents)
    async getByCohortId(
        @ReqUser() user: User,
        @Param("cohortId") cohortId: string,
        @RequestQuery() query: GetManyQuery<CohortStudents>,
    ) {
        return this.cohortStudentsService.getByCohortWithUsers(
            user,
            cohortId,
            query,
        );
    }

    @Get("by-student/:studentId")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({
        summary: "Lấy danh sách khóa học theo student ID",
        description:
            "API để lấy danh sách tất cả khóa học mà một sinh viên đã đăng ký",
    })
    @ApiParam({
        name: "studentId",
        description: "ID của sinh viên",
        type: String,
        example: "507f1f77bcf86cd799439011",
    })
    @ApiListResponse(CohortStudents)
    async getByStudentId(
        @ReqUser() user: User,
        @Param("studentId") studentId: string,
        @RequestQuery() query: GetManyQuery<CohortStudents>,
    ) {
        return this.cohortStudentsService.getMany(
            user,
            { student_id: studentId },
            query,
        );
    }

    @Post(":cohortId/add-multiple")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Thêm nhiều sinh viên vào một khóa học",
        description:
            "API để admin thêm nhiều sinh viên (student_id) vào một cohort trong một lần gọi",
    })
    async addMultipleStudents(
        @ReqUser() user: User,
        @Param("cohortId") cohortId: string,
        @Body() dto: AddMultipleCohortStudentsDto,
    ) {
        return this.cohortStudentsService.addMultipleStudents(
            user,
            cohortId,
            dto.student_ids,
        );
    }
}
