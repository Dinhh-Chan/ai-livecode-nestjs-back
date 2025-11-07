import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table, Index } from "sequelize-typescript";
import { CohortStudents } from "../entities/cohort-students.entity";

@Table({
    tableName: Entity.COHORT_STUDENTS,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["cohort_id", "student_id"],
        },
    ],
})
export class CohortStudentsModel extends Model implements CohortStudents {
    @StrObjectId()
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        field: "_id",
    })
    _id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        unique: true,
        field: "cohort_student_id",
    })
    cohort_student_id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: "cohort_id",
    })
    cohort_id: string;

    @Column({
        type: DataType.STRING(50),
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
    enrolled_at: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "is_active",
    })
    is_active: boolean;
}
