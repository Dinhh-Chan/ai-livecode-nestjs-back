import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Class } from "../entities/class.entity";

@Table({
    tableName: Entity.CLASSES,
    timestamps: true,
})
export class ClassModel extends Model implements Class {
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
        field: "class_id",
    })
    class_id: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: "class_name",
    })
    class_name: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        field: "class_code",
    })
    class_code: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: "course_id",
    })
    course_id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: "teacher_id",
    })
    teacher_id: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: "start_time",
    })
    start_time: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: "end_time",
    })
    end_time: Date;

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
}
