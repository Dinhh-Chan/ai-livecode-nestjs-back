import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { TestCaseResultsService } from "../services/test-case-results.services";
import { TestCaseResults } from "../entities/test-case-results.entity";
import { CreateTestCaseResultsDto } from "../dto/create-test-case-results.dto";
import { UpdateTestCaseResultsDto } from "../dto/update-test-case-results.dto";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ConditionTestCaseResultsDto } from "../dto/condition-test-case-results.dto";

@Controller("test-case-results")
@ApiTags("Test Case Results")
export class TestCaseResultsController extends BaseControllerFactory<TestCaseResults>(
    TestCaseResults,
    ConditionTestCaseResultsDto,
    CreateTestCaseResultsDto,
    UpdateTestCaseResultsDto,
) {
    constructor(
        private readonly testCaseResultsService: TestCaseResultsService,
    ) {
        super(testCaseResultsService);
    }
}
