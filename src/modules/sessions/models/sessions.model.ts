import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Session } from "../entities/sessions.entity";

@Table({
    tableName: Entity.SESSIONS,
    timestamps: true,
})
export class SessionModel extends Model implements Session {
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
        field: "user_id",
    })
    user_id: string;

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
        field: "session_name",
    })
    session_name: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        field: "question_id",
    })
    question_id?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "question_content",
    })
    question_content?: string;
}
