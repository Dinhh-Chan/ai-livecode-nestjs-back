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

    // Thêm nhiều sinh viên vào một lớp
    async addMultipleStudents(
        user: User,
        classId: string,
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
                    { class_id: classId, student_id: studentId } as any,
                    {},
                );
                if (existing) {
                    results.push({
                        student_id: studentId,
                        success: true,
                        message: "Đã tồn tại trong lớp",
                    });
                    successCount++;
                    continue;
                }

                // Tạo class_student_id duy nhất
                const classStudentId = `cls_${classId}_${Date.now()}_${i}`;

                await this.create(user, {
                    class_student_id: classStudentId,
                    class_id: classId,
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
}
