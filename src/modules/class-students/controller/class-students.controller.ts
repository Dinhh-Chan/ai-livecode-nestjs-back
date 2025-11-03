import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ClassStudentsService } from "../services/class-students.services";
import { ClassStudents } from "../entities/class-students.entity";
import { CreateClassStudentsDto } from "../dto/create-class-students.dto";
import { UpdateClassStudentsDto } from "../dto/update-class-students.dto";
import { Controller, Get, Param, Query, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionClassStudentsDto } from "../dto/condition-class-students.dto";
import { GetManyQuery } from "@common/constant";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { ApiListResponse } from "@common/decorator/api.decorator";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";
import { AddMultipleClassStudentsDto } from "../dto/add-multiple-class-students.dto";

@Controller("class-students")
@ApiTags("Class Students")
export class ClassStudentsController extends BaseControllerFactory<ClassStudents>(
    ClassStudents,
    ConditionClassStudentsDto,
    CreateClassStudentsDto,
    UpdateClassStudentsDto,
) {
    constructor(private readonly classStudentsService: ClassStudentsService) {
        super(classStudentsService);
    }

    @Get("many")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({ summary: "Lấy danh sách sinh viên trong lớp" })
    @ApiListResponse(ClassStudents)
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionClassStudentsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<ClassStudents>,
    ) {
        return this.classStudentsService.getMany(user, conditions, query);
    }

    @Get("by-class/:classId")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({
        summary: "Lấy danh sách sinh viên theo class ID",
        description:
            "API để lấy danh sách tất cả sinh viên trong một lớp học cụ thể",
    })
    @ApiParam({
        name: "classId",
        description: "ID của lớp học",
        type: String,
        example: "507f1f77bcf86cd799439011",
    })
    @ApiQuery({
        name: "select",
        required: false,
        description: "Các trường cần lấy",
        type: String,
        example: "_id,class_student_id,student_id,enrolled_at,is_active",
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
    @ApiListResponse(ClassStudents)
    async getByClassId(
        @ReqUser() user: User,
        @Param("classId") classId: string,
        @RequestQuery() query: GetManyQuery<ClassStudents>,
    ) {
        return this.classStudentsService.getByClassWithUsers(
            user,
            classId,
            query,
        );
    }

    @Get("by-student/:studentId")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({
        summary: "Lấy danh sách lớp học theo student ID",
        description:
            "API để lấy danh sách tất cả lớp học mà một sinh viên đã đăng ký",
    })
    @ApiParam({
        name: "studentId",
        description: "ID của sinh viên",
        type: String,
        example: "507f1f77bcf86cd799439011",
    })
    @ApiListResponse(ClassStudents)
    async getByStudentId(
        @ReqUser() user: User,
        @Param("studentId") studentId: string,
        @RequestQuery() query: GetManyQuery<ClassStudents>,
    ) {
        return this.classStudentsService.getMany(
            user,
            { student_id: studentId },
            query,
        );
    }

    @Post(":classId/add-multiple")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Thêm nhiều sinh viên vào một lớp",
        description:
            "API để admin thêm nhiều sinh viên (student_id) vào một class trong một lần gọi",
    })
    async addMultipleStudents(
        @ReqUser() user: User,
        @Param("classId") classId: string,
        @Body() dto: AddMultipleClassStudentsDto,
    ) {
        return this.classStudentsService.addMultipleStudents(
            user,
            classId,
            dto.student_ids,
        );
    }
}
