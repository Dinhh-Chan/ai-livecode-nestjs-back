import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Index, Model, Table } from "sequelize-typescript";
import { CourseProblems } from "../entities/course-problems.entity";

@Table({
    tableName: Entity.COURSE_PROBLEMS,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["course_id", "problem_id"],
        },
    ],
})
export class CourseProblemsModel extends Model implements CourseProblems {
    @StrObjectId()
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        field: "_id",
    })
    _id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "course_id",
    })
    course_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "problem_id",
    })
    problem_id: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "order_index",
    })
    order_index?: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_visible",
    })
    is_visible?: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_required",
    })
    is_required?: boolean;
}
