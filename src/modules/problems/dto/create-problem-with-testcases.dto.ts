import { Type } from "class-transformer";
import { IsArray, ValidateNested, ArrayMinSize } from "class-validator";
import { CreateProblemsDto } from "./create-problems.dto";
import { CreateTestCasesDto } from "../../test-cases/dto/create-test-cases.dto";

export class CreateProblemWithTestcasesDto {
    @ValidateNested()
    @Type(() => CreateProblemsDto)
    problem: CreateProblemsDto;

    @IsArray()
    @ArrayMinSize(1, { message: "Phải có ít nhất một test case" })
    @ValidateNested({ each: true })
    @Type(() => CreateTestCasesDto)
    testCases: CreateTestCasesDto[];
}
