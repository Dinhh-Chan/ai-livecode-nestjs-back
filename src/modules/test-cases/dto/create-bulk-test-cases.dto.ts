import { Type } from "class-transformer";
import { IsArray, ValidateNested, ArrayMinSize } from "class-validator";
import { CreateTestCasesDto } from "./create-test-cases.dto";

export class CreateBulkTestCasesDto {
    @IsArray()
    @ArrayMinSize(1, { message: "Phải có ít nhất một test case" })
    @ValidateNested({ each: true })
    @Type(() => CreateTestCasesDto)
    testCases: CreateTestCasesDto[];
}
