import { StrObjectId } from "@common/constant";
import { EntityDefinition } from "@common/constant/class/entity-definition";
import { BaseEntity } from "@common/interface/base-entity.interface";
import { IsString, IsOptional, IsEnum } from "class-validator";

export enum LogEventType {
    HEARTBEAT = "heartbeat",
    SUBMISSION_ASSIGNED = "submission_assigned",
    SUBMISSION_COMPLETED = "submission_completed",
    ERROR = "error",
    NODE_ONLINE = "node_online",
    NODE_OFFLINE = "node_offline",
    MAINTENANCE_START = "maintenance_start",
    MAINTENANCE_END = "maintenance_end",
    LOAD_CHANGED = "load_changed",
    STATUS_CHANGED = "status_changed",
}

export class JudgeNodeLogs implements BaseEntity {
    @StrObjectId()
    _id: string;

    /**
     * ID của Judge0 node
     * @example 64f1234567890abcdef12345
     */
    @IsString()
    @EntityDefinition.field({ label: "ID Judge0 node", required: true })
    judge_node_id: string;

    /**
     * Loại sự kiện log
     */
    @IsEnum(LogEventType)
    @EntityDefinition.field({
        label: "Loại sự kiện",
        enum: Object.values(LogEventType),
        example: LogEventType.HEARTBEAT,
    })
    event_type: LogEventType;

    /**
     * Nội dung log chi tiết
     * @example "Node started processing submission 12345"
     */
    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Nội dung log" })
    message?: string;

    // Virtual relationships
    @EntityDefinition.field({
        label: "Judge Node",
        disableImport: true,
        propertyTarget: "JudgeNodes",
    })
    judge_node?: any;
}
