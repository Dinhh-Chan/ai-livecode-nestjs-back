import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import { ApiListResponse } from "@common/decorator/api.decorator";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { SystemRole } from "@module/user/common/constant";
import { User } from "@module/user/entities/user.entity";
import { CourseProblems } from "../entities/course-problems.entity";
import { CourseProblemsService } from "../services/course-problems.service";
import { ConditionCourseProblemDto } from "../dto/condition-course-problem.dto";
import { CreateCourseProblemDto } from "../dto/create-course-problem.dto";
import { UpdateCourseProblemDto } from "../dto/update-course-problem.dto";

@Controller("course-problems")
@ApiTags("Course Problems")
export class CourseProblemsController extends BaseControllerFactory<CourseProblems>(
    CourseProblems,
    ConditionCourseProblemDto,
    CreateCourseProblemDto,
    UpdateCourseProblemDto,
    {
        authorize: true,
        routes: {
            getById: {
                roles: [
                    SystemRole.USER,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                    SystemRole.ADMIN,
                ],
            },
            getOne: {
                roles: [
                    SystemRole.USER,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                    SystemRole.ADMIN,
                ],
            },
            getMany: {
                roles: [
                    SystemRole.USER,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                    SystemRole.ADMIN,
                ],
            },
            getPage: {
                roles: [
                    SystemRole.USER,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                    SystemRole.ADMIN,
                ],
            },
            create: {
                roles: [SystemRole.TEACHER, SystemRole.ADMIN],
            },
            updateById: {
                roles: [SystemRole.TEACHER, SystemRole.ADMIN],
            },
            deleteById: {
                roles: [SystemRole.TEACHER, SystemRole.ADMIN],
            },
            updateByIds: {
                roles: [SystemRole.TEACHER, SystemRole.ADMIN],
            },
            deleteByIds: {
                roles: [SystemRole.TEACHER, SystemRole.ADMIN],
            },
        },
    },
) {
    constructor(private readonly courseProblemsService: CourseProblemsService) {
        super(courseProblemsService);
    }

    @Get("course/:courseId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({ summary: "Lấy danh sách bài tập trong khóa học" })
    @ApiListResponse(CourseProblems)
    @ApiQuery({
        name: "includeHidden",
        required: false,
        type: Boolean,
        description: "Bao gồm cả bài tập bị ẩn",
    })
    async getByCourse(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @Query("includeHidden") includeHidden?: string,
    ) {
        const include = includeHidden === "true";
        return this.courseProblemsService.findByCourse(courseId, include);
    }

    @Get("course/:courseId/details")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({
        summary: "Lấy danh sách bài tập trong khóa học kèm thông tin chi tiết",
    })
    @ApiListResponse(CourseProblems)
    @ApiQuery({
        name: "includeHidden",
        required: false,
        type: Boolean,
        description: "Bao gồm cả bài tập bị ẩn",
    })
    async getWithDetails(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @Query("includeHidden") includeHidden?: string,
    ) {
        const include = includeHidden === "true";
        return this.courseProblemsService.findWithDetails(
            user,
            courseId,
            include,
        );
    }
}
