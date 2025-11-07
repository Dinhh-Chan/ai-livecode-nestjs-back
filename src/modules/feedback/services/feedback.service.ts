import { BaseService } from "@config/service/base.service";
import { Feedback } from "../entities/feedback.entity";
import { FeedbackRepository } from "../repository/feedback-repository.interface";
import {
    Injectable,
    Inject,
    forwardRef,
    Logger,
    BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@module/repository/common/repository";
import { Entity } from "@module/repository";
import { User } from "@module/user/entities/user.entity";
import { UserService } from "@module/user/service/user.service";
import { GetManyQuery } from "@common/constant";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "@config/configuration";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class FeedbackService extends BaseService<Feedback, FeedbackRepository> {
    private readonly logger = new Logger(FeedbackService.name);
    private readonly uploadDir: string;

    constructor(
        @InjectRepository(Entity.FEEDBACK)
        private readonly feedbackRepository: FeedbackRepository,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
        private readonly configService: ConfigService<Configuration>,
    ) {
        super(feedbackRepository);
        // Tạo thư mục upload nếu chưa tồn tại
        const uploadPath = path.join(
            process.cwd(),
            "public",
            "feedback-images",
        );
        this.uploadDir = uploadPath;
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
            this.logger.log(`Created upload directory: ${this.uploadDir}`);
        }
    }

    /**
     * Lưu file ảnh vào thư mục public/feedback-images
     */
    async saveImage(file: Express.Multer.File): Promise<string> {
        try {
            // Validate file type
            const allowedMimeTypes = [
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif",
                "image/webp",
            ];
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new BadRequestException(
                    `File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`,
                );
            }

            // Generate unique filename
            const fileExt = path.extname(file.originalname);
            const filename = `${Date.now()}_${uuidv4()}${fileExt}`;
            const filepath = path.join(this.uploadDir, filename);

            // Write file to disk
            fs.writeFileSync(filepath, file.buffer);

            // Return relative path
            const serverAddress = this.configService.get("server.address", {
                infer: true,
            });
            const imageUrl = `${serverAddress}/public/feedback-images/${filename}`;
            this.logger.log(`Image saved: ${imageUrl}`);
            return imageUrl;
        } catch (error) {
            this.logger.error(
                `Error saving image: ${error.message}`,
                error.stack,
            );
            throw error;
        }
    }

    /**
     * Xóa file ảnh
     */
    async deleteImage(imageUrl: string): Promise<void> {
        try {
            if (!imageUrl) return;

            // Extract filename from URL
            const filename = path.basename(imageUrl);
            const filepath = path.join(this.uploadDir, filename);

            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                this.logger.log(`Image deleted: ${filepath}`);
            }
        } catch (error) {
            this.logger.error(
                `Error deleting image: ${error.message}`,
                error.stack,
            );
            // Không throw error để không ảnh hưởng đến việc xóa feedback
        }
    }

    /**
     * Lấy danh sách feedback với thông tin user
     */
    async getManyWithUsers(
        user: User,
        conditions: any,
        query?: GetManyQuery<Feedback>,
    ): Promise<any[]> {
        const list = await this.getMany(user, conditions, query || {});
        if ((list as any[]).length === 0) return list as any[];
        const userIds = Array.from(
            new Set((list as any[]).map((i) => i.user_id).filter(Boolean)),
        );
        let userMap = new Map<string, any>();
        if (userIds.length > 0) {
            const users = await this.userService.getMany(
                user,
                { _id: { $in: userIds } } as any,
                {},
            );
            userMap = new Map(
                users.map((u: any) => [
                    u._id,
                    {
                        _id: u._id,
                        username: u.username,
                        fullname: u.fullname,
                        email: u.email,
                    },
                ]),
            );
        }
        return (list as any[]).map((i) => ({
            ...i,
            user_basic: userMap.get(i.user_id) || null,
        }));
    }

    /**
     * Override deleteById để xóa ảnh khi xóa feedback
     */
    async deleteById(user: User, id: string): Promise<Feedback> {
        const feedback = await this.getById(user, id);
        if (feedback?.image_url) {
            await this.deleteImage(feedback.image_url);
        }
        return super.deleteById(user, id);
    }
}
