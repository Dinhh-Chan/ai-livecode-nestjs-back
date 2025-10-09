import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsIn,
} from "class-validator";
import { EntityDefinition } from "@common/constant/class/entity-definition";

export class CreateTestCaseResultsDto {
    @IsString()
    @IsNotEmpty({ message: "ID kết quả test case không được để trống" })
    @EntityDefinition.field({ label: "ID kết quả test case", required: true })
    result_id: string;

    @IsString()
    @IsNotEmpty({ message: "ID submission của học sinh không được để trống" })
    @EntityDefinition.field({
        label: "ID submission của học sinh",
        required: true,
    })
    submission_id: string;

    @IsString()
    @IsNotEmpty({ message: "ID test case không được để trống" })
    @EntityDefinition.field({ label: "ID test case", required: true })
    test_case_id: string;

    @IsString()
    @IsNotEmpty({ message: "Trạng thái test case không được để trống" })
    @IsIn(["passed", "failed", "error"], {
        message: "Trạng thái phải là passed, failed hoặc error",
    })
    @EntityDefinition.field({ label: "Trạng thái test case", required: true })
    status: string;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Kết quả thực tế" })
    actual_output?: string;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Thời gian thực thi (ms)" })
    execution_time_ms?: number;

    @IsNumber()
    @IsOptional()
    @EntityDefinition.field({ label: "Bộ nhớ sử dụng (MB)" })
    memory_used_mb?: number;

    @IsString()
    @IsOptional()
    @EntityDefinition.field({ label: "Thông báo lỗi" })
    error_message?: string;
}
