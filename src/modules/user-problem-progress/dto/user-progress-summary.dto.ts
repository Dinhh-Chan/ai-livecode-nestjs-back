import { EntityDefinition } from "@common/constant/class/entity-definition";

export class UserProgressSummaryDto {
    @EntityDefinition.field({ label: "Tổng số bài đã thử làm" })
    total_attempted: number;

    @EntityDefinition.field({ label: "Tổng số bài đã giải được" })
    total_solved: number;

    @EntityDefinition.field({ label: "Tỷ lệ giải được (%)" })
    solve_rate: number;

    @EntityDefinition.field({ label: "Tổng thời gian làm bài (giây)" })
    total_time_spent: number;
}
