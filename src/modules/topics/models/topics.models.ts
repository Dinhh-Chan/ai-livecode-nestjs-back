import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Topics } from "../entities/topics.entity";

@Table({
    tableName: Entity.TOPICS,
    timestamps: true,
})
export class TopicsModel extends Model implements Topics {
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
        field: "_topic_name",
    })
    topic_name: string;

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
    sub_topics?: any[];
    problems?: any[];
}
