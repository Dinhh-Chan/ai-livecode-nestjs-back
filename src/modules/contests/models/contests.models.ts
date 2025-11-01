import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Contests, ContestType } from "../entities/contests.entity";

@Table({
    tableName: Entity.CONTESTS,
    timestamps: true,
})
export class ContestsModel extends Model implements Contests {
    @StrObjectId()
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        field: "_id",
    })
    _id: string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
        field: "_contest_name",
    })
    contest_name: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "_description",
    })
    description?: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: "_start_time",
    })
    start_time: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: "_end_time",
    })
    end_time: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: "_created_time",
    })
    created_time: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "_is_active",
    })
    is_active: boolean;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "_duration_minutes",
    })
    duration_minutes?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        field: "_max_problems",
    })
    max_problems?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "_order_index",
    })
    order_index: number;

    @Column({
        type: DataType.ENUM(...Object.values(ContestType)),
        allowNull: false,
        defaultValue: ContestType.PRACTICE,
        field: "_type",
    })
    type: ContestType;

    // Virtual fields for relationships
    contest_users?: any[];
    contest_problems?: any[];
}
