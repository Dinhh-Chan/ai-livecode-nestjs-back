import { EntityDefinition } from "@common/constant/class/entity-definition";

export class ProblemStatusDto {
    @EntityDefinition.field({ label: "Đã giải được" })
    is_solved: boolean;

    @EntityDefinition.field({ label: "Đã thử làm" })
    is_attempted: boolean;

    @EntityDefinition.field({ label: "Số lần thử làm" })
    attempt_count: number;

    @EntityDefinition.field({ label: "Điểm số tốt nhất" })
    best_score: number;

    @EntityDefinition.field({ label: "Trạng thái cuối cùng" })
    last_status?: string;
}
