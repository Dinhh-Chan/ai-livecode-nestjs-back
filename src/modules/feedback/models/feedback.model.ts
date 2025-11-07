import { StrObjectId } from "@common/constant";
import { Entity } from "@module/repository";
import { Column, DataType, Model, Table } from "sequelize-typescript";
import {
    Feedback,
    FeedbackType,
    FeedbackStatus,
} from "../entities/feedback.entity";

@Table({
    tableName: Entity.FEEDBACK,
    timestamps: true,
})
export class FeedbackModel extends Model implements Feedback {
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
        type: DataType.ENUM(...Object.values(FeedbackType)),
        allowNull: false,
        field: "type",
    })
    type: FeedbackType;

    @Column({
        type: DataType.STRING(200),
        allowNull: false,
        field: "title",
    })
    title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
        field: "description",
    })
    description: string;

    @Column({
        type: DataType.ENUM(...Object.values(FeedbackStatus)),
        allowNull: false,
        defaultValue: FeedbackStatus.PENDING,
        field: "status",
    })
    status: FeedbackStatus;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
        field: "admin_note",
    })
    admin_note?: string;

    @Column({
        type: DataType.STRING(500),
        allowNull: true,
        field: "image_url",
    })
    image_url?: string;
}
