import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table, Index } from "sequelize-typescript";
import { ClassStudents } from "../entities/class-students.entity";

@Table({
    tableName: Entity.CLASS_STUDENTS,
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ["class_id", "student_id"],
        },
    ],
})
export class ClassStudentsModel extends Model implements ClassStudents {
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
        field: "class_student_id",
    })
    class_student_id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: "class_id",
    })
    class_id: string;

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
