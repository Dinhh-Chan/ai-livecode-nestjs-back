import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { Class } from "../entities/class.entity";

export interface ClassRepository extends BaseRepository<Class> {
    // Các method custom cho Class nếu cần
}
