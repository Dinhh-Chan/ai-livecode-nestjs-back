import { PartialType } from "@nestjs/mapped-types";
import { TestCaseResults } from "../entities/test-case-results.entity";

export class ConditionTestCaseResultsDto extends PartialType(TestCaseResults) {}
