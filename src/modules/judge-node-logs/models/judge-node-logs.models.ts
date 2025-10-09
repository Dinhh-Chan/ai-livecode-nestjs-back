import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import {
    JudgeNodeLogs,
    LogEventType,
} from "../entities/judge-node-logs.entity";

@Table({
    tableName: Entity.JUDGE_NODE_LOGS,
    timestamps: true,
})
export class JudgeNodeLogsModel extends Model implements JudgeNodeLogs {
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
        field: "_judge_node_id",
    })
    judge_node_id: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        field: "_event_type",
    })
    event_type: LogEventType;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_message",
    })
    message?: string;
}
