import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { JudgeNodes, JudgeNodeStatus } from "../entities/judge-nodes.entity";

@Table({
    tableName: Entity.JUDGE_NODES,
    timestamps: true,
})
export class JudgeNodesModel extends Model implements JudgeNodes {
    @StrObjectId()
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        field: "_id",
    })
    _id: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: "_name",
    })
    name: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: "_ip_address",
    })
    ip_address: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: "_api_url",
    })
    api_url: string;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        defaultValue: JudgeNodeStatus.ONLINE,
        field: "_status",
    })
    status: JudgeNodeStatus;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "_current_load",
    })
    current_load: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 10,
        field: "_max_capacity",
    })
    max_capacity: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        defaultValue: DataType.NOW,
        field: "_last_heartbeat",
    })
    last_heartbeat: Date;
}
