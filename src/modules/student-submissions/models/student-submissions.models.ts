import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import {
    StudentSubmissions,
    SubmissionStatus,
    ProgrammingLanguage,
} from "../entities/student-submissions.entity";

@Table({
    tableName: Entity.STUDENT_SUBMISSIONS,
    timestamps: true,
})
export class StudentSubmissionsModel
    extends Model
    implements StudentSubmissions
{
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
        field: "_submission_id",
    })
    submission_id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: "_student_id",
    })
    student_id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: "_problem_id",
    })
    problem_id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        field: "_class_id",
    })
    class_id?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: "_judge_node_id",
    })
    judge_node_id?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: "_code",
    })
    code: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 71, // Python 3.8.1
        field: "_language_id",
    })
    language_id: number;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        defaultValue: SubmissionStatus.PENDING,
        field: "_status",
    })
    status: SubmissionStatus;

    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.0,
        field: "_score",
    })
    score?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "_execution_time_ms",
    })
    execution_time_ms?: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
        field: "_memory_used_mb",
    })
    memory_used_mb?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "_test_cases_passed",
    })
    test_cases_passed?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "_total_test_cases",
    })
    total_test_cases?: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_error_message",
    })
    error_message?: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: "_submission_token",
    })
    submission_token?: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        defaultValue: DataType.NOW,
        field: "_submitted_at",
    })
    submitted_at?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: "_judged_at",
    })
    judged_at?: Date;
}
