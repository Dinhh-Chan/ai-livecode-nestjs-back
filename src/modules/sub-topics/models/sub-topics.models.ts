import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { SubTopics } from "../entities/sub-topics.entity";

@Table({
    tableName: Entity.SUB_TOPICS,
    timestamps: true,
})
export class SubTopicsModel extends Model implements SubTopics {
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
        field: "_topic_id",
    })
    topic_id: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: "_sub_topic_name",
    })
    sub_topic_name: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_description",
    })
    description?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_lo",
    })
    lo?: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "_order_index",
    })
    order_index: number;

    // Virtual fields for relationships
    topic?: any;
    problems?: any[];
}
