import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { TestCases } from "../entities/test-cases.entity";

@Table({
    tableName: Entity.TEST_CASES,
    timestamps: true,
})
export class TestCasesModel extends Model implements TestCases {
    @StrObjectId()
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        field: '_id'
    })
    _id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: '_problem_id'
    })
    problem_id: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: '_input_data'
    })
    input_data: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: '_expected_output'
    })
    expected_output: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: '_is_public'
    })
    is_public: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: '_order_index'
    })
    order_index: number;

    // Virtual fields for relationships
    problem?: any;
}
