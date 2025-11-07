import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Cohort } from "../entities/cohorts.entity";

@Table({
    tableName: Entity.COHORTS,
    timestamps: true,
})
export class CohortModel extends Model implements Cohort {
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
        field: "_code",
    })
    code: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        field: "_name",
    })
    name: string;

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
        type: DataType.TEXT,
        allowNull: true,
        field: "_description",
    })
    description?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: "_is_active",
    })
    is_active: boolean;
}
