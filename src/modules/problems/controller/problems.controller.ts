import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { ProblemsService } from "../services/problems.services";
import { Problems, ProblemDifficulty } from "../entities/problems.entity";
import { CreateProblemsDto } from "../dto/create-problems.dto";
import { UpdateProblemsDto } from "../dto/update-problems.dto";
import { CreateBulkProblemsDto } from "../dto/create-bulk-problems.dto";
import { CreateProblemWithTestcasesDto } from "../dto/create-problem-with-testcases.dto";
import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Query,
    BadRequestException,
} from "@nestjs/common";
import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiResponse,
} from "@nestjs/swagger";
import { ConditionProblemsDto } from "../dto/condition-problems.dto";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import { SystemRole } from "@module/user/common/constant";
import { GetManyQuery, GetOneQuery, GetPageQuery } from "@common/constant";
import {
    RequestQuery,
    RequestCondition,
} from "@common/decorator/query.decorator";
import { User } from "@module/user/entities/user.entity";
import {
    ApiCondition,
    ApiGet,
    ApiListResponse,
    ApiRecordResponse,
} from "@common/decorator/api.decorator";
import { BaseRouteSetup } from "@config/controller/base-controller.decorator";
import { PopulationDto } from "@common/dto/population.dto";

@Controller("problems")
@ApiTags("Problems")
export class ProblemsController extends BaseControllerFactory<Problems>(
    Problems,
    ConditionProblemsDto,
    CreateProblemsDto,
    UpdateProblemsDto,
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
    constructor(private readonly problemsService: ProblemsService) {
        super(problemsService);
    }

    // Override các method để sử dụng population
    // Đặt getMany trước getById để tránh route conflict
    @BaseRouteSetup("getMany", { authorize: false }, "get")
    @ApiListResponse(Problems)
    @ApiCondition()
    @ApiGet({ mode: "many" })
    async getMany(
        @ReqUser() user: User,
        @RequestCondition(ConditionProblemsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Problems>,
    ) {
        // Nếu user là STUDENT, chỉ trả về problems có is_public = true
        if (user?.systemRole === SystemRole.STUDENT) {
            conditions = {
                ...conditions,
                is_public: true,
            };
        }

        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        return this.problemsService.getPage(user, conditions, {
            ...query,
            population,
        });
    }

    @BaseRouteSetup("getOne", { authorize: false }, "get")
    @ApiRecordResponse(Problems)
    @ApiCondition()
    @ApiGet({ mode: "one" })
    async getOne(
        @ReqUser() user: User,
        @RequestCondition(ConditionProblemsDto) conditions: any,
        @RequestQuery() query: GetOneQuery<Problems>,
    ) {
        // Nếu user là STUDENT, chỉ trả về problems có is_public = true
        if (user?.systemRole === SystemRole.STUDENT) {
            conditions = {
                ...conditions,
                is_public: true,
            };
        }

        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        return this.problemsService.getOne(user, conditions, {
            ...query,
            population,
        });
    }

    @BaseRouteSetup("getPage", { authorize: false }, "get")
    @ApiListResponse(Problems)
    @ApiCondition()
    @ApiGet()
    async getPage(
        @ReqUser() user: User,
        @RequestCondition(ConditionProblemsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Problems>,
    ) {
        // Nếu user là STUDENT, chỉ trả về problems có is_public = true
        if (user?.systemRole === SystemRole.STUDENT) {
            conditions = {
                ...conditions,
                is_public: true,
            };
        }

        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        return this.problemsService.getPage(user, conditions, {
            ...query,
            population,
        });
    }

    @Get("search")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Tìm kiếm bài tập theo tên có phân trang",
        description:
            "API để tìm kiếm bài tập theo tên với phân trang. Tìm kiếm không phân biệt hoa thường. Có thể kết hợp với các filter khác như difficulty",
    })
    @ApiQuery({
        name: "name",
        required: true,
        description: "Từ khóa tìm kiếm theo tên bài tập",
        type: String,
        example: "bài tập",
    })
    @ApiQuery({
        name: "page",
        required: false,
        description: "Số trang (bắt đầu từ 1)",
        type: Number,
        example: 1,
    })
    @ApiQuery({
        name: "limit",
        required: false,
        description: "Số lượng bài tập trên mỗi trang",
        type: Number,
        example: 10,
    })
    @ApiQuery({
        name: "difficulty",
        required: false,
        description:
            "Lọc theo độ khó (1: Dễ, 2: Trung bình, 3: Bình thường, 4: Khó, 5: Rất khó)",
        type: Number,
        enum: [1, 2, 3, 4, 5],
        example: 1,
    })
    @ApiListResponse(Problems)
    @ApiCondition()
    @ApiGet()
    async searchProblemsByName(
        @ReqUser() user: User,
        @RequestCondition(ConditionProblemsDto) conditions: any,
        @RequestQuery() query: GetPageQuery<Problems>,
        @Query("name") name: string,
        @Query("difficulty") difficulty?: string,
    ) {
        // Validate name không được rỗng
        if (!name || name.trim().length === 0) {
            throw new BadRequestException("Tên tìm kiếm không được để trống");
        }

        // Nếu user là STUDENT, chỉ trả về problems có is_public = true
        if (user?.systemRole === SystemRole.STUDENT) {
            conditions = {
                ...conditions,
                is_public: true,
            };
        }

        // Thêm điều kiện search theo tên (không phân biệt hoa thường)
        // Sử dụng $regex - được hỗ trợ bởi cả MongoDB và Sequelize
        // MongoDB: $regex -> $regex với $options: "i"
        // Sequelize: $regex -> Op.iRegexp (case-insensitive regex)
        const searchTerm = name.trim();
        // Escape các ký tự đặc biệt trong regex
        const escapedSearchTerm = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
        );
        conditions = {
            ...conditions,
            name: {
                $regex: escapedSearchTerm, // Case-insensitive search
            },
        };

        // Merge difficulty vào conditions nếu có
        if (difficulty !== undefined && difficulty !== null) {
            const difficultyNum = Number(difficulty);
            // Validate difficulty phải là số từ 1-5
            if (
                isNaN(difficultyNum) ||
                difficultyNum < 1 ||
                difficultyNum > 5 ||
                !Number.isInteger(difficultyNum)
            ) {
                throw new BadRequestException(
                    "Độ khó phải là số nguyên từ 1 đến 5 (1: Dễ, 2: Trung bình, 3: Bình thường, 4: Khó, 5: Rất khó)",
                );
            }
            conditions = {
                ...conditions,
                difficulty: difficultyNum as ProblemDifficulty,
            };
        }

        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
        ];

        return this.problemsService.getPage(user, conditions, {
            ...query,
            population,
        });
    }

    @BaseRouteSetup("getById", { authorize: false }, "get")
    @ApiRecordResponse(Problems)
    async getById(@ReqUser() user: User, @Param("id") id: string) {
        // Nếu user là STUDENT, kiểm tra problem có is_public = true
        if (user?.systemRole === SystemRole.STUDENT) {
            const problem = await this.problemsService.getById(user, id, {});
            if (!problem || !problem.is_public) {
                throw new BadRequestException(
                    "Không tìm thấy bài tập hoặc bài tập không công khai",
                );
            }
        }

        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        return this.problemsService.getById(user, id, { population });
    }

    @Get("by-sub-topic/:subTopicId")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary: "Lấy danh sách problems theo sub_topic_id",
        description: "API để lấy tất cả problems thuộc về một sub topic cụ thể",
    })
    @ApiParam({
        name: "subTopicId",
        description: "ID của sub topic",
        type: String,
    })
    @ApiQuery({
        name: "sort",
        required: false,
        description: "Trường để sắp xếp",
        enum: [
            "name",
            "difficulty",
            "created_at",
            "updated_at",
            "time_limit_ms",
            "memory_limit_mb",
        ],
        example: "difficulty",
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
    @ApiQuery({
        name: "difficulty",
        required: false,
        description: "Lọc theo độ khó (1-5)",
        example: 2,
    })
    @ApiQuery({
        name: "is_public",
        required: false,
        description: "Lọc theo trạng thái công khai (true/false)",
        example: true,
    })
    async getProblemsBySubTopic(
        @ReqUser() user: User,
        @Param("subTopicId") subTopicId: string,
        @RequestQuery() query: GetPageQuery<Problems>,
    ) {
        // Nếu user là STUDENT, chỉ trả về problems có is_public = true
        const conditions: any = { sub_topic_id: subTopicId };
        if (user?.systemRole === SystemRole.STUDENT) {
            conditions.is_public = true;
        }

        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
            {
                path: "test_cases",
                condition: { is_public: true },
                hasMany: true,
            },
        ];
        const pageResult = await this.problemsService.getPage(
            user,
            conditions,
            {
                ...query,
                population,
            },
        );
        // Trả về mảng problems trực tiếp thay vì wrapper PageableDto
        return pageResult.result;
    }

    @Get("by-sub-topic/:subTopicId/without-testcases")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary:
            "Lấy danh sách problems theo sub_topic_id (không bao gồm testcases)",
        description:
            "API trả về danh sách problems thuộc sub topic nhưng không kèm testcases để tối ưu kích thước response",
    })
    @ApiParam({
        name: "subTopicId",
        description: "ID của sub topic",
        type: String,
    })
    @ApiQuery({
        name: "sort",
        required: false,
        description: "Trường để sắp xếp",
        enum: [
            "name",
            "difficulty",
            "created_at",
            "updated_at",
            "time_limit_ms",
            "memory_limit_mb",
        ],
        example: "difficulty",
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
    @ApiQuery({
        name: "difficulty",
        required: false,
        description: "Lọc theo độ khó (1-5)",
        example: 2,
    })
    @ApiQuery({
        name: "is_public",
        required: false,
        description: "Lọc theo trạng thái công khai (true/false)",
        example: true,
    })
    async getProblemsBySubTopicWithoutTestcases(
        @ReqUser() user: User,
        @Param("subTopicId") subTopicId: string,
        @RequestQuery() query: GetPageQuery<Problems>,
    ) {
        const conditions: any = { sub_topic_id: subTopicId };
        if (user?.systemRole === SystemRole.STUDENT) {
            conditions.is_public = true;
        }

        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
        ];
        const pageResult = await this.problemsService.getPage(
            user,
            conditions,
            {
                ...query,
                population,
            },
        );
        const solved = await this.problemsService.countSolvedProblemsBySubTopic(
            user,
            subTopicId,
        );
        return {
            ...pageResult,
            solved,
        };
    }

    @Get("admin/fix-memory-limits")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Sửa memory limits quá cao",
        description: "API để sửa các problems có memory_limit_mb >= 512",
    })
    async fixMemoryLimits(@ReqUser() user: User) {
        // Lấy tất cả problems để kiểm tra
        const allProblems = await this.problemsService.getMany(user, {}, {});

        // Lọc các problems có memory_limit_mb > 512
        const problemsWithHighMemory = allProblems.filter(
            (p) => p.memory_limit_mb >= 512,
        );

        const fixedProblems = [];

        for (const problem of problemsWithHighMemory) {
            try {
                const updatedProblem = await this.problemsService.updateById(
                    user,
                    problem._id,
                    { memory_limit_mb: 500 },
                );
                fixedProblems.push({
                    _id: problem._id,
                    name: problem.name,
                    old_memory_limit: problem.memory_limit_mb,
                    new_memory_limit: 500,
                });
            } catch (error) {
                console.error(`Error fixing problem ${problem._id}:`, error);
            }
        }

        return {
            message: `Fixed ${fixedProblems.length} problems with high memory limits`,
            total_problems: allProblems.length,
            problems_with_high_memory: problemsWithHighMemory.length,
            fixed_problems: fixedProblems,
            total_found: problemsWithHighMemory.length,
        };
    }

    @Get("admin/check-memory-limits")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Kiểm tra memory limits",
        description: "API để kiểm tra các problems có memory_limit_mb >= 512",
    })
    async checkMemoryLimits(@ReqUser() user: User) {
        // Lấy tất cả problems để kiểm tra
        const allProblems = await this.problemsService.getMany(user, {}, {});

        // Lọc các problems có memory_limit_mb > 512
        const problemsWithHighMemory = allProblems.filter(
            (p) => p.memory_limit_mb >= 512,
        );

        return {
            message: `Found ${problemsWithHighMemory.length} problems with memory_limit_mb > 512`,
            total_problems: allProblems.length,
            problems_with_high_memory: problemsWithHighMemory.map((p) => ({
                _id: p._id,
                name: p.name,
                memory_limit_mb: p.memory_limit_mb,
                difficulty: p.difficulty,
            })),
            // Hiển thị một vài examples để debug
            sample_problems: allProblems.slice(0, 5).map((p) => ({
                _id: p._id,
                name: p.name,
                memory_limit_mb: p.memory_limit_mb,
            })),
        };
    }

    @Post("bulk")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Tạo nhiều bài tập cùng lúc",
        description: "API để tạo nhiều bài tập cùng một lúc",
    })
    @ApiBody({ type: CreateBulkProblemsDto })
    @ApiResponse({
        status: 201,
        description: "Tạo thành công nhiều bài tập",
        type: [Problems],
    })
    async createBulkProblems(
        @ReqUser() user: User,
        @Body() dto: CreateBulkProblemsDto,
    ) {
        return this.problemsService.createBulkProblems(user, dto.problems);
    }

    @Post("with-testcases")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Tạo bài tập cùng với test cases",
        description: "API để tạo bài tập cùng với các test cases của nó",
    })
    @ApiBody({ type: CreateProblemWithTestcasesDto })
    @ApiResponse({
        status: 201,
        description: "Tạo thành công bài tập và test cases",
    })
    async createProblemWithTestCases(
        @ReqUser() user: User,
        @Body() dto: CreateProblemWithTestcasesDto,
    ) {
        // Lấy problem từ dto
        const problemDto = dto.problem;

        // Lấy test cases và xử lý input/input_data
        const testCases = (dto.testcase || dto.testCases || []).map((tc) => ({
            ...tc,
            // Hỗ trợ cả input và input_data
            input_data: tc.input_data || tc.input || "",
        }));

        return this.problemsService.createProblemWithTestCases(
            user,
            problemDto,
            testCases,
        );
    }

    @Get("list/basic")
    @AllowSystemRoles(
        SystemRole.USER,
        SystemRole.ADMIN,
        SystemRole.STUDENT,
        SystemRole.TEACHER,
    )
    @ApiOperation({
        summary:
            "Lấy danh sách bài tập cơ bản có phân trang (không bao gồm test cases)",
        description:
            "API để lấy danh sách bài tập có phân trang cùng với topic và subtopic nhưng không bao gồm test cases. Có thể lọc theo độ khó (1-5)",
    })
    @ApiQuery({
        name: "difficulty",
        required: false,
        description:
            "Lọc theo độ khó (1: Dễ, 2: Trung bình, 3: Bình thường, 4: Khó, 5: Rất khó)",
        type: Number,
        enum: [1, 2, 3, 4, 5],
        example: 1,
    })
    @ApiListResponse(Problems)
    @ApiCondition()
    @ApiGet()
    async getProblemsBasic(
        @ReqUser() user: User,
        @RequestCondition(ConditionProblemsDto) conditions: any,
        @RequestQuery() query: GetManyQuery<Problems>,
        @Query("difficulty") difficulty?: string,
    ) {
        // Nếu user là STUDENT, chỉ trả về problems có is_public = true
        if (user?.systemRole === SystemRole.STUDENT) {
            conditions = {
                ...conditions,
                is_public: true,
            };
        }

        // Merge difficulty vào conditions nếu có
        if (difficulty !== undefined && difficulty !== null) {
            const difficultyNum = Number(difficulty);
            // Validate difficulty phải là số từ 1-5
            if (
                isNaN(difficultyNum) ||
                difficultyNum < 1 ||
                difficultyNum > 5 ||
                !Number.isInteger(difficultyNum)
            ) {
                throw new BadRequestException(
                    "Độ khó phải là số nguyên từ 1 đến 5 (1: Dễ, 2: Trung bình, 3: Bình thường, 4: Khó, 5: Rất khó)",
                );
            }
            conditions = {
                ...conditions,
                difficulty: difficultyNum as ProblemDifficulty,
            };
        }

        const population: PopulationDto<Problems>[] = [
            { path: "topic" },
            { path: "sub_topic" },
        ];
        return this.problemsService.getPage(user, conditions, {
            ...query,
            population,
        });
    }
}
