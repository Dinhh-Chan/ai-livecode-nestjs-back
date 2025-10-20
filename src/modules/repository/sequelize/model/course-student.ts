import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";
import { Entity } from "@module/repository";
import { StrObjectId } from "@common/constant";
import { CoursesModel } from "@module/courses/models/courses.model";
import { UserModel } from "./user.model";

@Table({
    tableName: Entity.COURSE_STUDENT,
    timestamps: true,
    createdAt: "enrolled_at",
    updatedAt: "updated_at",
})
export class CourseStudent extends Model {
    @StrObjectId()
    _id: string;

    @ForeignKey(() => CoursesModel)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "course_id",
    })
    course_id: string;
    @ForeignKey(() => UserModel)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "student_id",
    })
    student_id: string;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: "enrolled_at",
    })
    enrolled_at?: Date;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: "updated_at",
    })
    updated_at?: Date;
    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: "completed_at",
    })
    completed_at?: Date;

    //Relationships
    @BelongsTo(() => CoursesModel, "course_id")
    course: CoursesModel;
    @BelongsTo(() => UserModel, "student_id")
    student: UserModel;
}
