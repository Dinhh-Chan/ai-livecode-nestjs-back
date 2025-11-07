import { BaseService } from "@config/service/base.service";
import { CohortStudents } from "../entities/cohort-students.entity";
import { CohortStudentsRepository } from "../repository/cohort-students-repository.interface";
import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { UserService } from "@module/user/service/user.service";
import { GetManyQuery } from "@common/constant";

@Injectable()
export class CohortStudentsService extends BaseService<
    CohortStudents,
    CohortStudentsRepository
> {
    constructor(
        @InjectRepository(Entity.COHORT_STUDENTS)
        private readonly cohortStudentsRepository: CohortStudentsRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {
        super(cohortStudentsRepository);
    }

    // Thêm nhiều sinh viên vào một khóa học
    async addMultipleStudents(
        user: User,
        cohortId: string,
        studentIds: string[],
    ): Promise<{
        success: number;
        failed: number;
        results: Array<{
            student_id: string;
            success: boolean;
            message?: string;
        }>;
    }> {
        const results: Array<{
            student_id: string;
            success: boolean;
            message?: string;
        }> = [];

        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < studentIds.length; i++) {
            const studentId = studentIds[i];
            try {
                // Kiểm tra tồn tại
                const existing = await this.getOne(
                    user,
                    { cohort_id: cohortId, student_id: studentId } as any,
                    {},
                );
                if (existing) {
                    results.push({
                        student_id: studentId,
                        success: true,
                        message: "Đã tồn tại trong khóa học",
                    });
                    successCount++;
                    continue;
                }

                // Tạo cohort_student_id duy nhất
                const cohortStudentId = `coh_${cohortId}_${Date.now()}_${i}`;

                await this.create(user, {
                    cohort_student_id: cohortStudentId,
                    cohort_id: cohortId,
                    student_id: studentId,
                    enrolled_at: new Date(),
                    is_active: true,
                } as any);

                results.push({ student_id: studentId, success: true });
                successCount++;
            } catch (error: any) {
                results.push({
                    student_id: studentId,
                    success: false,
                    message: error?.message || "Lỗi không xác định",
                });
                failedCount++;
            }
        }

        return { success: successCount, failed: failedCount, results };
    }

    async getByCohortWithUsers(
        user: User,
        cohortId: string,
        query?: GetManyQuery<CohortStudents>,
    ): Promise<any[]> {
        const list = await this.getMany(
            user,
            { cohort_id: cohortId } as any,
            query || { sort: { enrolled_at: -1 } },
        );
        if ((list as any[]).length === 0) return list as any[];
        const studentIds = Array.from(
            new Set((list as any[]).map((i) => i.student_id).filter(Boolean)),
        );
        let userMap = new Map<string, any>();
        if (studentIds.length > 0) {
            const users = await this.userService.getMany(
                user,
                { _id: { $in: studentIds } } as any,
                {},
            );
            userMap = new Map(
                users.map((u: any) => [
                    u._id,
                    {
                        _id: u._id,
                        username: u.username,
                        fullname: u.fullname,
                        studentPtitCode: u.studentPtitCode,
                    },
                ]),
            );
        }
        return (list as any[]).map((i) => ({
            ...i,
            student_basic: userMap.get(i.student_id) || null,
        }));
    }
}
