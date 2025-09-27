import { PartialType } from "@nestjs/mapped-types";
import { CreateTestCasesDto } from "./create-test-cases.dto";

export class UpdateTestCasesDto extends PartialType(CreateTestCasesDto) {}
