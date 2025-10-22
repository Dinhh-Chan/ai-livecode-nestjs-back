import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { UserRepository } from "../repository/user-repository.interface";
import { Entity } from "@module/repository";
import { InjectRepository } from "@module/repository/common/repository";
import { SystemRole } from "../common/constant";
import { createUserPassword } from "@common/constant/constant";

@Injectable()
export class AdminInitService implements OnApplicationBootstrap {
    private readonly logger = new Logger(AdminInitService.name);

    constructor(
        @InjectRepository(Entity.USER)
        private readonly userRepository: UserRepository,
    ) {}

    async onApplicationBootstrap() {
        await this.createDefaultAdmin();
    }

    private async createDefaultAdmin() {
        try {
            this.logger.log("Checking for default admin user...");

            // Kiểm tra xem admin user đã tồn tại chưa
            const existingAdmin = await this.userRepository.getOne(
                { username: "admin" },
                { enableDataPartition: false },
            );

            if (existingAdmin) {
                this.logger.log("Default admin user already exists");
                return;
            }

            // Tạo admin user mặc định
            const hashedPassword = await createUserPassword("admin");

            const adminUser = await this.userRepository.create({
                username: "admin",
                password: hashedPassword,
                email: "admin@admin.com",
                firstname: "Admin",
                lastname: "User",
                fullname: "Admin User",
                systemRole: SystemRole.ADMIN,
            });

            this.logger.log(
                `Default admin user created successfully with ID: ${adminUser._id}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to create default admin user: ${error.message}`,
            );
        }
    }
}
