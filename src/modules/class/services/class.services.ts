import { BaseService } from "@config/service/base.service";
import { Class } from "../entities/class.entity";
import { ClassRepository } from "../repository/class-repository.interface";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";

@Injectable()
export class ClassService extends BaseService<Class, ClassRepository> {
    constructor(
        @InjectRepository(Entity.CLASSES)
        private readonly classRepository: ClassRepository,
    ) {
        super(classRepository);
    }

    // Các method custom cho Class nếu cần
}
