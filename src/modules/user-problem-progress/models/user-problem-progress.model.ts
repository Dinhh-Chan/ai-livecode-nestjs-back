import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import {
    AllowNull,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";
import { UserProblemProgress } from "../entities/user-problem-progress.entity";
import { User } from "../../user/entities/user.entity";
import { Problems } from "../../problems/entities/problems.entity";
import { UserModel } from "@module/repository/sequelize/model/user.model";
import { ProblemsModel } from "../../problems/models/problems.models";

@Table({
    tableName: Entity.USER_PROBLEM_PROGRESS,
    timestamps: true,
})
export class UserProblemProgressModel
    extends Model
    implements UserProblemProgress
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
        field: "_user_id",
    })
    @ForeignKey(() => UserModel)
    user_id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        field: "_problem_id",
    })
    @ForeignKey(() => ProblemsModel)
    problem_id: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "_is_solved",
    })
    is_solved: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "_is_attempted",
    })
    is_attempted: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: "_first_attempt_at",
    })
    first_attempt_at?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: "_solved_at",
    })
    solved_at?: Date;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "_best_score",
    })
    best_score?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "_attempt_count",
    })
    attempt_count: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "_total_time_spent",
    })
    total_time_spent?: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: "_last_status",
    })
    last_status?: string;

    // Virtual fields for relationships
    @BelongsTo(() => UserModel, {
        targetKey: "_id",
        foreignKey: "user_id",
    })
    user?: User;

    @BelongsTo(() => ProblemsModel, {
        targetKey: "_id",
        foreignKey: "problem_id",
    })
    problem?: Problems;
}
