import { EntityDefinition } from "@common/constant/class/entity-definition";

export class UserProgressStatsDto {
    @EntityDefinition.field({ label: "Tổng số bài đã thử làm" })
    total_attempted: number;

    @EntityDefinition.field({ label: "Tổng số bài đã giải được" })
    total_solved: number;

    @EntityDefinition.field({ label: "Tỷ lệ giải được (%)" })
    solve_rate: number;

    @EntityDefinition.field({ label: "Tổng thời gian làm bài (giây)" })
    total_time_spent: number;

    @EntityDefinition.field({ label: "Số bài giải được theo độ khó" })
    solved_by_difficulty: { [key: number]: number };
}
