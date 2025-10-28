import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
} from "sequelize-typescript";
import { Entity } from "@module/repository";
import { StrObjectId } from "@common/constant";
import { UserModel } from "./user.model";
import { CoursesModel } from "@module/courses/models/courses.model";
@Table({
    tableName: Entity.COURSE_TEACHER,
    timestamps: true,
    createdAt: "assigned_at",
    updatedAt: "updated_at",
})
export class CourseTeacher extends Model {
    @PrimaryKey
    @StrObjectId()
    _id: string;

    @ForeignKey(() => CoursesModel)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "course_id",
    })
    course_id: string;

    @Column({
        type: DataType.ENUM("main", "assistant", "guest"),
        allowNull: false,
        defaultValue: "main",
        field: "role",
    })
    role: string;

    @ForeignKey(() => UserModel)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "teacher_id",
    })
    teacher_id: string;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: "assigned_at",
    })
    assigned_at?: Date;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: "updated_at",
    })
    updated_at?: Date;

    //Relationships
    @BelongsTo(() => CoursesModel, "course_id")
    course: CoursesModel;
    @BelongsTo(() => UserModel, "teacher_id")
    teacher: UserModel;
}
