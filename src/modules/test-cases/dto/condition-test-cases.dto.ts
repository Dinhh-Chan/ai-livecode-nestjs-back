import { PartialType } from "@nestjs/mapped-types";
import { TestCases } from "../entities/test-cases.entity";

export class ConditionTestCasesDto extends PartialType(TestCases) {}
