import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { Controller, Get, Post, Delete, Param, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { Courses } from "../entities/courses.entity";
import { CoursesService } from "../services/courses.service";
import { CreateCourseDto } from "../dto/create-course.dto";
import { UpdateCourseDto } from "../dto/update-course.dto";
import { EnrollStudentDto } from "../dto/enroll-student.dto";
import { AssignTeacherDto } from "../dto/assign-teacher.dto";
import { SelfEnrollDto } from "../dto/self-enroll.dto";
import { SystemRole } from "@module/user/common/constant";

@Controller("courses")
@ApiTags("courses")
export class CoursesController extends BaseControllerFactory<Courses>(
    Courses,
    null, // conditionDto
    CreateCourseDto, // createDto
    UpdateCourseDto, // updateDto
    {
        import: {
            enable: true,
        },
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
                roles: [SystemRole.ADMIN],
            },
            updateByIds: {
                roles: [SystemRole.TEACHER, SystemRole.ADMIN],
            },
            deleteByIds: {
                roles: [SystemRole.ADMIN],
            },
            importDefinition: {
                roles: [SystemRole.ADMIN],
            },
            importXlsxTemplate: {
                roles: [SystemRole.ADMIN],
            },
            importInsert: {
                roles: [SystemRole.ADMIN],
            },
            importValidate: {
                roles: [SystemRole.ADMIN],
            },
            exportDefinition: {
                roles: [SystemRole.ADMIN],
            },
            exportXlsx: {
                roles: [SystemRole.ADMIN],
            },
        },
        dataPartition: {
            enable: true,
        },
    },
) {
    constructor(private readonly coursesService: CoursesService) {
        super(coursesService);
    }

    @Get("my-teaching")
    @AllowSystemRoles(SystemRole.TEACHER, SystemRole.ADMIN)
    @ApiOperation({ summary: "Lấy danh sách khóa học tôi dạy" })
    @ApiResponse({ status: 200, description: "Danh sách khóa học thành công" })
    async getMyTeachingCourses(@ReqUser() user: User) {
        return this.coursesService.getMyTeachingCourses(user);
    }

    @Get("my-enrolled")
    @AllowSystemRoles(SystemRole.STUDENT, SystemRole.TEACHER, SystemRole.ADMIN)
    @ApiOperation({ summary: "Lấy danh sách khóa học tôi tham gia" })
    @ApiResponse({ status: 200, description: "Danh sách khóa học thành công" })
    async getMyEnrolledCourses(@ReqUser() user: User) {
        return this.coursesService.getMyEnrolledCourses(user);
    }

    @Get("teacher/:teacherId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({ summary: "Lấy danh sách khóa học theo giáo viên" })
    @ApiResponse({ status: 200, description: "Danh sách khóa học thành công" })
    async getCoursesByTeacher(
        @ReqUser() user: User,
        @Param("teacherId") teacherId: string,
    ) {
        return this.coursesService.getCoursesByTeacher(user, teacherId);
    }

    @Get("student/:studentId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({ summary: "Lấy danh sách khóa học theo học viên" })
    @ApiResponse({ status: 200, description: "Danh sách khóa học thành công" })
    async getCoursesByStudent(
        @ReqUser() user: User,
        @Param("studentId") studentId: string,
    ) {
        return this.coursesService.getCoursesByStudent(user, studentId);
    }

    @Get("active")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({ summary: "Lấy danh sách khóa học đang hoạt động" })
    @ApiResponse({ status: 200, description: "Danh sách khóa học thành công" })
    async getActiveCourses(@ReqUser() user: User) {
        return this.coursesService.getActiveCourses(user);
    }

    @Get(":courseId/students")
    @AllowSystemRoles(SystemRole.TEACHER, SystemRole.ADMIN)
    @ApiOperation({ summary: "Lấy danh sách học viên trong khóa học" })
    @ApiResponse({ status: 200, description: "Danh sách học viên thành công" })
    async getCourseStudents(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
    ) {
        return this.coursesService.getCourseStudents(user, courseId);
    }

    @Get(":courseId/teachers")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({ summary: "Lấy danh sách giáo viên trong khóa học" })
    @ApiResponse({ status: 200, description: "Danh sách giáo viên thành công" })
    async getCourseTeachers(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
    ) {
        return this.coursesService.getCourseTeachers(user, courseId);
    }

    @Post(":courseId/enroll")
    @AllowSystemRoles(SystemRole.TEACHER, SystemRole.ADMIN)
    @ApiOperation({ summary: "Đăng ký học viên vào khóa học" })
    @ApiResponse({ status: 201, description: "Đăng ký thành công" })
    async enrollStudent(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @Body() dto: EnrollStudentDto,
    ) {
        return this.coursesService.enrollStudent(user, courseId, dto);
    }

    @Post(":courseId/self-enroll")
    @AllowSystemRoles(SystemRole.STUDENT, SystemRole.TEACHER, SystemRole.ADMIN)
    @ApiOperation({ summary: "Tự đăng ký vào khóa học" })
    @ApiResponse({ status: 201, description: "Đăng ký thành công" })
    async selfEnroll(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @Body() dto: SelfEnrollDto,
    ) {
        return this.coursesService.selfEnroll(user, courseId, dto);
    }

    @Post(":courseId/assign-teacher")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({ summary: "Phân công giáo viên vào khóa học" })
    @ApiResponse({ status: 201, description: "Phân công thành công" })
    async assignTeacher(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @Body() dto: AssignTeacherDto,
    ) {
        return this.coursesService.assignTeacher(user, courseId, dto);
    }

    @Delete(":courseId/students/:studentId")
    @AllowSystemRoles(SystemRole.TEACHER, SystemRole.ADMIN)
    @ApiOperation({ summary: "Xóa học viên khỏi khóa học" })
    @ApiResponse({ status: 200, description: "Xóa thành công" })
    async removeStudentFromCourse(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @Param("studentId") studentId: string,
    ) {
        return this.coursesService.removeStudentFromCourse(
            user,
            courseId,
            studentId,
        );
    }

    @Delete(":courseId/teachers/:teacherId")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({ summary: "Xóa giáo viên khỏi khóa học" })
    @ApiResponse({ status: 200, description: "Xóa thành công" })
    async removeTeacherFromCourse(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @Param("teacherId") teacherId: string,
    ) {
        return this.coursesService.removeTeacherFromCourse(
            user,
            courseId,
            teacherId,
        );
    }

    @Get(":courseId/problems/:problemId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
        SystemRole.ADMIN,
    )
    @ApiOperation({
        summary: "Lấy thông tin chi tiết một problem trong course",
        description:
            "API trả về thông tin chi tiết của một problem trong course, bao gồm thông tin course-problem (order_index, is_hidden) và thông tin problem đầy đủ",
    })
    @ApiResponse({
        status: 200,
        description: "Lấy thông tin problem thành công",
    })
    @ApiResponse({
        status: 404,
        description: "Không tìm thấy course hoặc problem",
    })
    async getProblemInCourse(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @Param("problemId") problemId: string,
    ) {
        return this.coursesService.getProblemInCourse(
            user,
            courseId,
            problemId,
        );
    }
}
