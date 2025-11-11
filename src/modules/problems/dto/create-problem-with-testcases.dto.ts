import { Type } from "class-transformer";
import { IsArray, ValidateNested, IsOptional } from "class-validator";
import { CreateProblemsDto } from "./create-problems.dto";
import { CreateTestCasesWithoutProblemIdDto } from "./create-test-cases-without-problem-id.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProblemWithTestcasesDto extends CreateProblemsDto {
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateTestCasesWithoutProblemIdDto)
    @ApiProperty({
        description: "Danh sách test cases (có thể để trống)",
        required: false,
        default: [],
    })
    testCases?: CreateTestCasesWithoutProblemIdDto[];

    // Hỗ trợ cả testcase (chữ thường) từ request
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateTestCasesWithoutProblemIdDto)
    @ApiProperty({
        description: "Danh sách test cases (alias cho testCases)",
        required: false,
        default: [],
    })
    testcase?: CreateTestCasesWithoutProblemIdDto[];

    // Hỗ trợ nested structure (backward compatibility)
    @ValidateNested()
    @IsOptional()
    @Type(() => CreateProblemsDto)
    @ApiProperty({
        description: "Thông tin bài tập (nested format)",
        required: false,
    })
    problem?: CreateProblemsDto;
}
