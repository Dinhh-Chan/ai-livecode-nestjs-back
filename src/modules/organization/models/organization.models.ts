import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Organization } from "../entities/organization.entity";

@Table({
    tableName: Entity.ORGANIZATION,
    timestamps: true,
})
export class OrganizationModel extends Model implements Organization {
    @StrObjectId()
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        field: '_id'
    })
    _id: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: '_organId'
    })
    organId: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        unique: true,
        field: '_ssId'
    })
    ssId: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: '_organizationInCharge'
    })
    organizationInCharge?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: '_organName'
    })
    organName: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: '_organAdd'
    })
    organAdd?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: '_email'
    })
    email?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: '_telephone'
    })
    telephone?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: '_fax'
    })
    fax?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: '_website'
    })
    website?: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true,
        field: '_isExternal'
    })
    isExternal?: boolean;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: '_description'
    })
    description?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: '_status'
    })
    status?: string;
}