import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ClassService } from "../services/class.services";
import { Class } from "../entities/class.entity";
import { CreateClassDto } from "../dto/create-class.dto";
import { UpdateClassDto } from "../dto/update-class.dto";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionClassDto } from "../dto/condition-class.dto";
import { GetManyQuery } from "@common/constant";
import { ReqUser, AllowSystemRoles } from "@common/decorator/auth.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";
import { ApiListResponse } from "@common/decorator/api.decorator";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";

@Controller("classes")
@ApiTags("Classes")
export class ClassController extends BaseControllerFactory<Class>(
    Class,
    ConditionClassDto,
    CreateClassDto,
    UpdateClassDto,
) {
    constructor(private readonly classService: ClassService) {
        super(classService);
    }

    @Get("many")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({ summary: "Lấy danh sách lớp học" })
    @ApiListResponse(Class)
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionClassDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Class>,
    ) {
        return this.classService.getMany(user, conditions, query);
    }

    @Get("by-course/:courseId")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({
        summary: "Lấy danh sách lớp học theo course ID",
        description:
            "API để lấy danh sách tất cả lớp học thuộc về một khóa học cụ thể",
    })
    @ApiParam({
        name: "courseId",
        description: "ID của khóa học",
        type: String,
        example: "507f1f77bcf86cd799439011",
    })
    @ApiQuery({
        name: "select",
        required: false,
        description: "Các trường cần lấy",
        type: String,
        example: "_id,class_id,class_name,class_code,start_time,end_time",
    })
    @ApiQuery({
        name: "sort",
        required: false,
        description: "Sắp xếp theo trường",
        type: String,
        example: "start_time",
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
    @ApiListResponse(Class)
    async getByCourseId(
        @ReqUser() user: User,
        @Param("courseId") courseId: string,
        @RequestQuery() query: GetManyQuery<Class>,
    ) {
        return this.classService.getMany(user, { course_id: courseId }, query);
    }

    @Get("by-teacher/:teacherId")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN, SystemRole.STUDENT)
    @ApiOperation({
        summary: "Lấy danh sách lớp học theo teacher ID",
        description: "API để lấy danh sách tất cả lớp học mà một giáo viên dạy",
    })
    @ApiParam({
        name: "teacherId",
        description: "ID của giáo viên",
        type: String,
        example: "507f1f77bcf86cd799439011",
    })
    @ApiListResponse(Class)
    async getByTeacherId(
        @ReqUser() user: User,
        @Param("teacherId") teacherId: string,
        @RequestQuery() query: GetManyQuery<Class>,
    ) {
        return this.classService.getMany(
            user,
            { teacher_id: teacherId },
            query,
        );
    }
}
