import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ContestSubmissions } from "../entities/contest-submissions.entity";
import { SubmissionStatus } from "@module/student-submissions/entities/student-submissions.entity";

@Table({
    tableName: Entity.CONTEST_SUBMISSIONS,
    timestamps: true,
    indexes: [
        {
            fields: ["_contest_id"],
            name: "contest_submissions_contest_id_idx",
        },
        {
            fields: ["_student_id"],
            name: "contest_submissions_student_id_idx",
        },
        {
            fields: ["_problem_id"],
            name: "contest_submissions_problem_id_idx",
        },
        {
            fields: ["_submission_id"],
            name: "contest_submissions_submission_id_idx",
        },
        {
            fields: ["_contest_id", "_student_id", "_problem_id"],
            unique: true,
            name: "contest_submissions_contest_student_problem_unique_idx",
        },
    ],
})
export class ContestSubmissionsModel
    extends Model
    implements ContestSubmissions
{
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
        field: "_contest_id",
    })
    contest_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "_submission_id",
    })
    submission_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "_student_id",
    })
    student_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "_problem_id",
    })
    problem_id: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: "_code",
    })
    code: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 71,
        field: "_language_id",
    })
    language_id: number;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        defaultValue: SubmissionStatus.ACCEPTED,
        field: "_status",
    })
    status: SubmissionStatus;

    @Column({
        type: DataType.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 100.0,
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
        type: DataType.DATE,
        allowNull: true,
        defaultValue: DataType.NOW,
        field: "_submitted_at",
    })
    submitted_at?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        defaultValue: DataType.NOW,
        field: "_solved_at",
    })
    solved_at?: Date;
}
