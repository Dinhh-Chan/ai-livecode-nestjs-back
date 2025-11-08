import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import { Message, MessageRole } from "../entities/messages.entity";

@Table({
    tableName: Entity.MESSAGES,
    timestamps: true,
})
export class MessageModel extends Model implements Message {
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
        field: "session_id",
    })
    session_id: string;

    @Column({
        type: DataType.ENUM(...Object.values(MessageRole)),
        allowNull: false,
        field: "role",
    })
    role: MessageRole;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: "content",
    })
    content: string;
}
