import { Type } from "class-transformer";
import { IsArray, ValidateNested, ArrayMinSize } from "class-validator";
import { CreateProblemsDto } from "./create-problems.dto";
import { CreateTestCasesWithoutProblemIdDto } from "./create-test-cases-without-problem-id.dto";

export class CreateProblemWithTestcasesDto {
    @ValidateNested()
    @Type(() => CreateProblemsDto)
    problem: CreateProblemsDto;

    @IsArray()
    @ArrayMinSize(1, { message: "Phải có ít nhất một test case" })
    @ValidateNested({ each: true })
    @Type(() => CreateTestCasesWithoutProblemIdDto)
    testCases: CreateTestCasesWithoutProblemIdDto[];
}
