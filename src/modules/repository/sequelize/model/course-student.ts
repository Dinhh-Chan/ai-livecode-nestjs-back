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
import { CoursesModel } from "@module/courses/models/courses.model";
import { UserModel } from "./user.model";

@Table({
    tableName: Entity.COURSE_STUDENT,
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ["course_id", "student_id"],
        },
    ],
})
export class CourseStudent extends Model {
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
        field: "join_at",
    })
    join_at?: Date;

    //Relationships
    @BelongsTo(() => CoursesModel, "course_id")
    course: CoursesModel;
    @BelongsTo(() => UserModel, "student_id")
    student: UserModel;
}
