import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { TestCaseResults } from "../entities/test-case-results.entity";

@Table({
    tableName: Entity.TEST_CASE_RESULTS,
    timestamps: true,
})
export class TestCaseResultsModel extends Model implements TestCaseResults {
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
        field: "_result_id",
    })
    result_id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: "_submission_id",
    })
    submission_id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: "_test_case_id",
    })
    test_case_id: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        field: "_status",
    })
    status: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_actual_output",
    })
    actual_output?: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "_execution_time_ms",
    })
    execution_time_ms: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        field: "_memory_used_mb",
    })
    memory_used_mb: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_error_message",
    })
    error_message?: string;

    // Virtual fields for relationships
    student_submission?: any;
    test_case?: any;
}
