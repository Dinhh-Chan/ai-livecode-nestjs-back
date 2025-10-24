import { Type } from "class-transformer";
import { IsArray, ValidateNested, ArrayMinSize } from "class-validator";
import { CreateProblemsDto } from "./create-problems.dto";

export class CreateBulkProblemsDto {
    @IsArray()
    @ArrayMinSize(1, { message: "Phải có ít nhất một bài tập" })
    @ValidateNested({ each: true })
    @Type(() => CreateProblemsDto)
    problems: CreateProblemsDto[];
}
