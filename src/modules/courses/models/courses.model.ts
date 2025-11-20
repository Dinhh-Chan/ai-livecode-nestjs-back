import {
    Table,
    Column,
    Model,
    DataType,
    BelongsToMany,
    HasMany,
    PrimaryKey,
} from "sequelize-typescript";
import { Entity } from "@module/repository";
import { Courses } from "../entities/courses.entity";
import { UserModel } from "@module/repository/sequelize/model/user.model";
import { CourseStudent } from "@module/repository/sequelize/model/course-student";
import { CourseTeacher } from "@module/repository/sequelize/model/course-teacher";
import { StrObjectId } from "@common/constant";

@Table({
    tableName: Entity.COURSES,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
})
export class CoursesModel extends Model implements Courses {
    @PrimaryKey
    @StrObjectId()
    _id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
    })
    course_name: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        unique: true,
    })
    course_code: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "description",
    })
    description?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
    })
    is_active: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "is_public",
    })
    is_public?: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: "created_at",
    })
    createdAt?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: "updated_at",
    })
    updatedAt?: Date;

    // Many-to-Many relationships
    @BelongsToMany(
        () => UserModel,
        () => CourseStudent,
        "course_id",
        "student_id",
    )
    students?: UserModel[];

    @BelongsToMany(
        () => UserModel,
        () => CourseTeacher,
        "course_id",
        "teacher_id",
    )
    teachers?: UserModel[];

    // Direct relationships through junction tables
    @HasMany(() => CourseStudent, "course_id")
    courseStudents?: CourseStudent[];

    @HasMany(() => CourseTeacher, "course_id")
    courseTeachers?: CourseTeacher[];
}
