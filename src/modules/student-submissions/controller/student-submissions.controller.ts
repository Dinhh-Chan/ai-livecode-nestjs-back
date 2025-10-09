import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { StudentSubmissionsService } from "../services/student-submissions.services";
import { StudentSubmissions } from "../entities/student-submissions.entity";
import { CreateStudentSubmissionsDto } from "../dto/create-student-submissions.dto";
import { UpdateStudentSubmissionsDto } from "../dto/update-student-submissions.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionStudentSubmissionsDto } from "../dto/condition-student-submissions.dto";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";

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
                roles: [SystemRole.USER, SystemRole.ADMIN],
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
}
