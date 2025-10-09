import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { Entity } from "@module/repository";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsString, IsNumber, IsEnum, IsUrl } from "class-validator";
import { HydratedDocument } from "mongoose";

export enum JudgeNodeStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    MAINTENANCE = "maintenance",
}

@Schema({
    collection: Entity.JUDGE_NODES,
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
})
export class JudgeNodes implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * Tên node Judge0
     * @example Judge0-Node-1
     */
    @IsString()
    @Prop({ required: true, maxlength: 100 })
    @EntityDefinition.field({ label: "Tên node", required: true })
    name: string;

    /**
     * Địa chỉ IP của node
     * @example 192.168.1.100
     */
    @IsString()
    @Prop({ required: true, maxlength: 100 })
    @EntityDefinition.field({ label: "Địa chỉ IP", required: true })
    ip_address: string;

    /**
     * URL API của node
     * @example http://judge0-node1:2358
     */
    @IsUrl()
    @Prop({ required: true, maxlength: 255 })
    @EntityDefinition.field({ label: "URL API", required: true })
    api_url: string;

    /**
     * Trạng thái node
     */
    @IsEnum(JudgeNodeStatus)
    @Prop({
        type: String,
        enum: Object.values(JudgeNodeStatus),
        default: JudgeNodeStatus.ONLINE,
    })
    @EntityDefinition.field({
        label: "Trạng thái",
        enum: Object.values(JudgeNodeStatus),
        example: JudgeNodeStatus.ONLINE,
    })
    status: JudgeNodeStatus;

    /**
     * Số bài đang chấm
     */
    @IsNumber()
    @Prop({ default: 0 })
    @EntityDefinition.field({ label: "Tải hiện tại" })
    current_load: number;

    /**
     * Giới hạn chấm song song
     */
    @IsNumber()
    @Prop({ default: 10 })
    @EntityDefinition.field({ label: "Dung lượng tối đa" })
    max_capacity: number;

    /**
     * Lần heartbeat cuối
     */
    @Prop({ default: Date.now })
    @EntityDefinition.field({ label: "Lần heartbeat cuối" })
    last_heartbeat: Date;
}

export type JudgeNodesDocument = HydratedDocument<JudgeNodes>;
export const JudgeNodesSchema = SchemaFactory.createForClass(JudgeNodes);
