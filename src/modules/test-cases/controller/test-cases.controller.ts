import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { TestCasesService } from "../services/test-cases.services";
import { TestCases } from "../entities/test-cases.entity";
import { CreateTestCasesDto } from "../dto/create-test-cases.dto";
import { UpdateTestCasesDto } from "../dto/update-test-cases.dto";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ConditionTestCasesDto } from "../dto/condition-test-cases.dto";
import { GetManyQuery } from "@common/constant";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import { RequestQuery } from "@common/decorator/query.decorator";
import { User } from "@module/user/entities/user.entity";
import { SystemRole } from "@module/user/common/constant";

@Controller("test-cases")
@ApiTags("Test Cases")
export class TestCasesController extends BaseControllerFactory<TestCases>(
    TestCases,
    ConditionTestCasesDto,
    CreateTestCasesDto,
    UpdateTestCasesDto,
    {
        authorize: true,
        routes: {
            getById: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            getMany: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            getPage: {
                roles: [SystemRole.USER, SystemRole.ADMIN],
            },
            create: {
                roles: [SystemRole.ADMIN],
            },
            updateById: {
                roles: [SystemRole.ADMIN],
            },
            deleteById: {
                roles: [SystemRole.ADMIN],
            },
        },
    },
) {
    constructor(private readonly testCasesService: TestCasesService) {
        super(testCasesService);
    }

    @Get("by-problem/:problemId")
    @AllowSystemRoles(SystemRole.USER, SystemRole.ADMIN)
    @ApiOperation({
        summary: "Lấy danh sách test cases theo problem_id",
        description: "API để lấy tất cả test cases thuộc về một problem cụ thể",
    })
    @ApiParam({
        name: "problemId",
        description: "ID của problem",
        type: String,
    })
    @ApiQuery({
        name: "is_public",
        required: false,
        description: "Lọc theo trạng thái công khai (true/false)",
        example: true,
    })
    @ApiQuery({
        name: "sort",
        required: false,
        description: "Trường để sắp xếp",
        enum: [
            "order_index",
            "created_at",
            "updated_at",
            "input_data",
            "expected_output",
        ],
        example: "order_index",
    })
    @ApiQuery({
        name: "order",
        required: false,
        description: "Thứ tự sắp xếp (asc/desc). Mặc định là asc",
        enum: ["asc", "desc"],
        example: "asc",
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng records tối đa",
        example: 10,
    })
    async getTestCasesByProblem(
        @ReqUser() user: User,
        @Param("problemId") problemId: string,
        @RequestQuery() query: GetManyQuery<TestCases>,
    ) {
        return this.testCasesService.getMany(
            user,
            { problem_id: problemId },
            query,
        );
    }
}
