import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { TestCasesService } from "../services/test-cases.services";
import { TestCases } from "../entities/test-cases.entity";
import { CreateTestCasesDto } from "../dto/create-test-cases.dto";
import { UpdateTestCasesDto } from "../dto/update-test-cases.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionTestCasesDto } from "../dto/condition-test-cases.dto";

@Controller("test-cases")
@ApiTags("Test Cases")
export class TestCasesController extends BaseControllerFactory<TestCases>(
    TestCases,
    ConditionTestCasesDto,
    CreateTestCasesDto,
    UpdateTestCasesDto
) {
    constructor(private readonly testCasesService: TestCasesService) {
        super(testCasesService);
    }
}
