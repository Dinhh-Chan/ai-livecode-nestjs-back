import { BaseService } from "@config/service/base.service";
import { ClassStudents } from "../entities/class-students.entity";
import { ClassStudentsRepository } from "../repository/class-students-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";

@Injectable()
export class ClassStudentsService extends BaseService<
    ClassStudents,
    ClassStudentsRepository
> {
    constructor(
        @InjectRepository(Entity.CLASS_STUDENTS)
        private readonly classStudentsRepository: ClassStudentsRepository,
    ) {
        super(classStudentsRepository);
    }

    // Các method custom cho ClassStudents nếu cần
}
