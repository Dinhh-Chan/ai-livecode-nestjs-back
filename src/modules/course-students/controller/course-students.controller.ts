import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import {
    ApiListResponse,
    ApiRecordResponse,
} from "@common/decorator/api.decorator";
import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";
import { SystemRole } from "@module/user/common/constant";
import { User } from "@module/user/entities/user.entity";
import { CourseStudents } from "../entities/course-students.entity";
import { CourseStudentsService } from "../services/course-students.service";
import { ConditionCourseStudentDto } from "../dto/condition-course-student.dto";
import { CreateCourseStudentDto } from "../dto/create-course-student.dto";
import { UpdateCourseStudentDto } from "../dto/update-course-student.dto";

@Controller("course-students")
@ApiTags("Course Students")
export class CourseStudentsController extends BaseControllerFactory<CourseStudents>(
    CourseStudents,
    ConditionCourseStudentDto,
    CreateCourseStudentDto,
    UpdateCourseStudentDto,
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
            getOne: {
                roles: [
                    SystemRole.USER,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                    SystemRole.ADMIN,
                ],
            },
            create: {
                roles: [
                    SystemRole.USER,
                    SystemRole.STUDENT,
                    SystemRole.TEACHER,
                    SystemRole.ADMIN,
                ],
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
    constructor(private readonly courseStudentsService: CourseStudentsService) {
        super(courseStudentsService);
    }

    @Get("course/:courseId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({ summary: "Lấy danh sách học viên trong khóa học" })
    @ApiListResponse(CourseStudents)
    async getByCourse(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
    ) {
        return this.courseStudentsService.findByCourse(courseId);
    }

    @Get("student/:studentId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({ summary: "Lấy danh sách khóa học của học viên" })
    @ApiListResponse(CourseStudents)
    async getByStudent(
        @ReqUser() user: User,
        @Param("studentId") studentId: string,
    ) {
        return this.courseStudentsService.findByStudent(studentId);
    }

    @Post("course/:courseId/join")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({ summary: "Tự tham gia khóa học" })
    @ApiResponse({
        status: 201,
        description: "Tham gia khóa học thành công",
        type: CourseStudents,
    })
    async joinCourse(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
    ) {
        return this.courseStudentsService.joinCourse(user, courseId);
    }

    @Get("course/:courseId/student/:studentId/progress")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({
        summary: "Lấy tiến trình làm bài của học viên trong khóa học",
        description:
            "Trả về danh sách bài tập kèm trạng thái: completed, in_progress, not_started",
    })
    @ApiResponse({
        status: 200,
        description: "Lấy tiến trình thành công",
    })
    async getProgress(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @Param("studentId") studentId: string,
    ) {
        return this.courseStudentsService.getProgress(
            user,
            courseId,
            studentId,
        );
    }

    @Get("course/:courseId/my-progress")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({
        summary: "Lấy tiến trình làm bài của tôi trong khóa học",
        description:
            "Trả về danh sách bài tập kèm trạng thái: completed, in_progress, not_started",
    })
    @ApiResponse({
        status: 200,
        description: "Lấy tiến trình thành công",
    })
    async getMyProgress(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
    ) {
        return this.courseStudentsService.getProgress(user, courseId, user._id);
    }
}
