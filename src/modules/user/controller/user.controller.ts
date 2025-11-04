import { RequestAuthData } from "@common/constant/class/request-auth-data";
import { ApiRecordResponse } from "@common/decorator/api.decorator";
import { AllowSystemRoles, ReqUser } from "@common/decorator/auth.decorator";
import { BaseControllerFactory } from "@config/controller/base-controller-factory";
import { Body, Controller, Get, Put, Req, Param, Query } from "@nestjs/common";

import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { SystemRole } from "../common/constant";
import { ChangePasswordDto } from "../dto/change-password.dto";
import { UpdatePasswordByIdDto } from "../dto/update-password-by-id.dto";
import { UserStatisticsDto } from "../dto/user-statistics.dto";
import { SystemStatisticsDto } from "../dto/system-statistics.dto";
import { UserProfileDto } from "../dto/user-profile.dto";
import { User } from "../entities/user.entity";
import { UserService } from "../service/user.service";
import { GetManyQuery, GetPageQuery, OperatorType } from "@common/constant";

@Controller("user")
@ApiTags("user")
export class UserController extends BaseControllerFactory<User>(
    User,
    null,
    null,
    null,
    {
        import: {
            enable: false,
        },
        routes: {
            create: {
                enable: true,
                document: {
                    operator: {
                        summary: "Create a new User",
                        description:
                            "Create a new User record. Throw error if User with the same username existed",
                    },
                    response: { description: "Created User data" },
                },
            },
        },
        dataPartition: {
            enable: true,
        },
    },
) {
    constructor(private readonly userService: UserService) {
        super(userService);
    }

    @Get("me")
    @ApiRecordResponse(User)
    // @UseAuditLog({
    //     action: "getMe",
    //     sourceId: "response.data._id",
    //     description:
    //         "{{uName}} lấy thông tin user của mình (_id: {{response.data._id}})",
    //     logResponse: true,
    // })
    async getMe(@Req() req: Request) {
        const authData = req.user as RequestAuthData;
        return this.userService.getMe(authData);
    }

    @Put("me/password")
    @ApiRecordResponse(User)
    async changePasswordMe(@Body() dto: ChangePasswordDto) {
        return this.userService.changePasswordMe(null, dto);
    }

    @Put(":userId/password")
    @AllowSystemRoles(SystemRole.ADMIN)
    @ApiOperation({
        summary: "Admin update password cho user theo ID",
        description:
            "API để admin update password cho user khác. Password sẽ được tự động hash trước khi lưu vào database.",
    })
    @ApiRecordResponse(User)
    async updatePasswordById(
        @ReqUser() user: User,
        @Param("userId") userId: string,
        @Body() dto: UpdatePasswordByIdDto,
    ) {
        return this.userService.updatePasswordById(user, userId, dto.password);
    }

    @Get("statistics")
    @ApiRecordResponse(UserStatisticsDto)
    @ApiOperation({
        summary: "Lấy thống kê của user",
        description:
            "API để lấy thống kê chi tiết về submissions của user hiện tại",
    })
    async getUserStatistics(@Req() req: Request) {
        const user = req.user as User;
        return this.userService.getUserStatistics(user);
    }

    @Get("statistics/by-user-id/:userId")
    @ApiRecordResponse(UserStatisticsDto)
    @ApiOperation({
        summary: "Lấy thống kê của user theo ID",
        description:
            "API để lấy thống kê chi tiết về submissions của user theo ID được truyền vào",
    })
    async getUserStatisticsById(@Param("userId") userId: string) {
        return this.userService.getUserStatisticsById(userId);
    }

    @Get("system-statistics")
    @ApiRecordResponse(SystemStatisticsDto)
    @ApiOperation({
        summary: "Lấy thống kê tổng quan hệ thống",
        description:
            "API để lấy thống kê tổng quan về submissions, users, problems và các chỉ số khác của toàn bộ hệ thống",
    })
    async getSystemStatistics() {
        return this.userService.getSystemStatistics();
    }

    @Get("profile-me/user")
    @ApiRecordResponse(UserProfileDto)
    @ApiOperation({
        summary: "Lấy thông tin profile của user hiện tại",
        description:
            "API để lấy thông tin profile đầy đủ của user bao gồm: rank, số bài AC theo độ khó, số bài AC theo ngôn ngữ, recent AC, và skills",
    })
    async getProfileMe(@Req() req: Request) {
        const authData = req.user as RequestAuthData;
        const user = await authData.getUser();
        return this.userService.getUserProfile(user);
    }

    @Get("search-username")
    @ApiRecordResponse(User)
    @ApiOperation({
        summary: "Tìm user theo username",
        description:
            "Search theo username. Mặc định dùng CONTAIN. Nếu exact=true thì dùng EQUAL.",
    })
    async searchByUsername(
        @Req() req: Request,
        @Query("q") q: string,
        @Query("exact") exact?: string,
        @Query("limit") limit?: string,
        @Query("skip") skip?: string,
        @Query("select") select?: string,
        @Query("sort") sort?: string,
    ) {
        const authData = req.user as RequestAuthData;
        const user = await authData.getUser();
        if (!q || q.trim() === "") {
            return [];
        }
        const isExact = exact === "true";
        const conditions: any = isExact
            ? { username: { $eq: q } }
            : { username: { $like: `%${q}%` } };
        const query: any = {} as GetManyQuery<User>;
        if (limit) query.limit = Number(limit);
        if (skip) query.skip = Number(skip);
        if (select)
            query.select = select
                .split(",")
                .reduce(
                    (acc, f) => ((acc[f] = 1), acc),
                    {} as Record<string, number>,
                );
        if (sort) query.sort = { [sort]: 1 } as any;
        return this.userService.getMany(user, conditions, query);
    }

    @Get("search-username/page")
    @ApiRecordResponse(User)
    @ApiOperation({
        summary: "Tìm user theo username (có phân trang)",
        description:
            "Search theo username, trả về dạng phân trang. Mặc định CONTAIN, exact=true để so khớp chính xác.",
    })
    async searchByUsernamePage(
        @Req() req: Request,
        @Query("q") q: string,
        @Query("exact") exact?: string,
        @Query("page") page?: string,
        @Query("limit") limit?: string,
        @Query("select") select?: string,
        @Query("sort") sort?: string,
    ) {
        const authData = req.user as RequestAuthData;
        const user = await authData.getUser();
        if (!q || q.trim() === "") {
            return { page: 1, limit: 0, total: 0, result: [] };
        }
        const isExact = exact === "true";
        const operator = isExact ? OperatorType.EQUAL : OperatorType.CONTAIN;

        const query: GetPageQuery<User> = {
            filters: [
                {
                    field: "username",
                    operator,
                    values: [q],
                },
            ],
        };

        if (page) query.page = Number(page);
        if (limit) query.limit = Number(limit);
        if (select) {
            // Chuyển đổi id thành _id và parse select
            const normalizedSelect = select
                .split(",")
                .map((f) => (f.trim() === "id" ? "_id" : f.trim()))
                .filter((f) => f)
                .reduce(
                    (acc, f) => ((acc[f] = 1 as 0 | 1), acc),
                    {} as Record<string, 0 | 1>,
                );
            query.select = normalizedSelect as any;
        }
        if (sort) {
            // Parse sort: có thể là JSON hoặc field name đơn giản
            try {
                query.sort = JSON.parse(sort);
            } catch (e) {
                // Nếu không phải JSON, coi như là field name
                if (sort.startsWith("-")) {
                    query.sort = { [sort.substring(1)]: -1 } as any;
                } else {
                    query.sort = { [sort]: 1 } as any;
                }
            }
        }

        return this.userService.getPage(user, {}, query);
    }

    // @Get("test")
    // async test() {
    //     return this.userService.testUser();
    // }
}
