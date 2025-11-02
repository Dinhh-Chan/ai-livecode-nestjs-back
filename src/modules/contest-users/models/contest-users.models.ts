import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import {
    ContestUsers,
    ContestUserStatus,
} from "../entities/contest-users.entity";

@Table({
    tableName: Entity.CONTEST_USERS,
    timestamps: true,
    indexes: [
        {
            fields: ["_contest_id"],
            name: "contest_users_contest_id_idx",
        },
        {
            fields: ["_user_id"],
            name: "contest_users_user_id_idx",
        },
        {
            fields: ["_contest_id", "_user_id"],
            unique: true,
            name: "contest_users_contest_user_unique_idx",
        },
    ],
})
export class ContestUsersModel extends Model implements ContestUsers {
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
        field: "_user_id",
    })
    user_id: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "_accepted_count",
    })
    accepted_count: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "_is_manager",
    })
    is_manager: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "_order_index",
    })
    order_index: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: ContestUserStatus.PENDING,
        field: "_status",
    })
    status: ContestUserStatus;
}
