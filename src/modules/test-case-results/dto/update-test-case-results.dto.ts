import { PartialType } from "@nestjs/mapped-types";
import { CreateTestCaseResultsDto } from "./create-test-case-results.dto";

export class UpdateTestCaseResultsDto extends PartialType(
    CreateTestCaseResultsDto,
) {}
