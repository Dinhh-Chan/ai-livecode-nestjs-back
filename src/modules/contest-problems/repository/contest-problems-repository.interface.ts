import { BaseRepository } from "@module/repository/common/base-repository.interface";
import { ContestProblems } from "../entities/contest-problems.entity";

export interface ContestProblemsRepository
    extends BaseRepository<ContestProblems> {}
