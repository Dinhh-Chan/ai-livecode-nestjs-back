import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { TestCases } from "../entities/test-cases.entity";

export interface TestCasesRepository extends BaseRepository<TestCases> {}
