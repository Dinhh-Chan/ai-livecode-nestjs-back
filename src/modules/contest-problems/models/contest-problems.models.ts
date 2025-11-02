import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ContestProblems } from "../entities/contest-problems.entity";

@Table({
    tableName: Entity.CONTEST_PROBLEMS,
    timestamps: true,
    indexes: [
        {
            fields: ["_contest_id"],
            name: "contest_problems_contest_id_idx",
        },
        {
            fields: ["_problem_id"],
            name: "contest_problems_problem_id_idx",
        },
        {
            fields: ["_contest_id", "_problem_id"],
            unique: true,
            name: "contest_problems_contest_problem_unique_idx",
        },
        {
            fields: ["_contest_id", "_order_index"],
            name: "contest_problems_contest_order_idx",
        },
    ],
})
export class ContestProblemsModel extends Model implements ContestProblems {
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
        field: "_problem_id",
    })
    problem_id: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "_order_index",
    })
    order_index: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 100,
        field: "_score",
    })
    score: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "_is_visible",
    })
    is_visible: boolean;
}
