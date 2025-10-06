import {
    IsString,
    IsNotEmpty,
    IsBoolean,
    IsNumber,
    IsOptional,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateTestCasesDto {
    @IsString()
    @IsNotEmpty({ message: "Problem ID không được để trống" })
    @EntityDefinition.field({ label: "Problem ID", required: true })
    problem_id: string;

    @IsString()
    @IsNotEmpty({ message: "Dữ liệu đầu vào không được để trống" })
    @EntityDefinition.field({ label: "Dữ liệu đầu vào", required: true })
    input_data: string;

    @IsString()
    @IsNotEmpty({ message: "Kết quả mong đợi không được để trống" })
    @EntityDefinition.field({ label: "Kết quả mong đợi", required: true })
    expected_output: string;

    @IsBoolean()
    @IsOptional()
    @EntityDefinition.field({ label: "Test case công khai" })
    is_public?: boolean;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Thứ tự sắp xếp" })
    order_index?: number;
}
