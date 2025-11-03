import { BaseService } from "@config/service/base.service";
import { Class } from "../entities/class.entity";
import { ClassRepository } from "../repository/class-repository.interface";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { UserService } from "@module/user/service/user.service";
import { GetByIdQuery, GetManyQuery } from "@common/constant";

@Injectable()
export class ClassService extends BaseService<Class, ClassRepository> {
    constructor(
        @InjectRepository(Entity.CLASSES)
        private readonly classRepository: ClassRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {
        super(classRepository);
    }

    async getById(
        user: User,
        id: string,
        query?: GetByIdQuery<Class>,
    ): Promise<any> {
        const cls = await super.getById(user, id, query);
        if (!cls) return cls;
        if (!cls.teacher_id) return cls;
        const teacher = await this.userService.getById(
            user,
            cls.teacher_id,
            {},
        );
        if (!teacher) return cls;
        const { password, ssoId, email, ...basic } = teacher;
        return {
            ...cls,
            teacher_basic: {
                _id: basic._id,
                username: basic.username,
                fullname: basic.fullname,
            },
        };
    }

    async getMany(
        user: User,
        conditions: any,
        query?: GetManyQuery<Class>,
    ): Promise<any[]> {
        const list = await super.getMany(user, conditions, query);
        if (list.length === 0) return list as any[];
        const teacherIds = Array.from(
            new Set(list.map((c: any) => c.teacher_id).filter(Boolean)),
        );
        let teacherMap = new Map<string, any>();
        if (teacherIds.length > 0) {
            const users = await this.userService.getMany(
                user,
                { _id: { $in: teacherIds } } as any,
                {},
            );
            teacherMap = new Map(
                users.map((u: any) => [
                    u._id,
                    { _id: u._id, username: u.username, fullname: u.fullname },
                ]),
            );
        }
        return (list as any[]).map((c) => ({
            ...c,
            teacher_basic: teacherMap.get(c.teacher_id) || null,
        }));
    }
}
