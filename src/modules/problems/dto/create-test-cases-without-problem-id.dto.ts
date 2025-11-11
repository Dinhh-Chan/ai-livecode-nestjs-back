import {
    IsString,
    IsNotEmpty,
    IsBoolean,
    IsNumber,
    IsOptional,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateTestCasesWithoutProblemIdDto {
    // Hỗ trợ cả input và input_data
    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Dữ liệu đầu vào", required: false })
    input_data?: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({
        label: "Dữ liệu đầu vào (alias)",
        required: false,
    })
    input?: string;

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
