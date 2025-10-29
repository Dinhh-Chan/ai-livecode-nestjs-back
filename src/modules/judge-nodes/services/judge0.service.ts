import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import {
    ProgrammingLanguage,
    SubmissionStatus,
} from "@module/student-submissions/entities/student-submissions.entity";

export interface Judge0SubmissionRequest {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
    cpu_time_limit?: number;
    memory_limit?: number;
    compiler_options?: string;
    command_line_arguments?: string;
}

export interface Judge0SubmissionResponse {
    token: string;
    status?: {
        id: number;
        description: string;
    };
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    message?: string;
    time?: string;
    memory?: number;
    exit_code?: number;
    exit_signal?: number;
}

export interface Judge0Language {
    id: number;
    name: string;
}

@Injectable()
export class Judge0Service {
    private readonly logger = new Logger(Judge0Service.name);
    private readonly baseUrl: string;
    private readonly authToken?: string;

    // Mapping từ ProgrammingLanguage enum sang Judge0 language_id
    private readonly languageMapping: Record<ProgrammingLanguage, number> = {
        [ProgrammingLanguage.PYTHON]: 71, // Python 3.8.1
        [ProgrammingLanguage.JAVASCRIPT]: 63, // Node.js 12.14.0
        [ProgrammingLanguage.JAVA]: 62, // Java 13.0.1
        [ProgrammingLanguage.CPP]: 54, // C++ 17
        [ProgrammingLanguage.C]: 50, // C (GCC 9.2.0)
        [ProgrammingLanguage.CSHARP]: 51, // C# 8.0
        [ProgrammingLanguage.GO]: 60, // Go 1.13.5
        [ProgrammingLanguage.RUST]: 73, // Rust 1.40.0
        [ProgrammingLanguage.PHP]: 68, // PHP 7.4.1
        [ProgrammingLanguage.RUBY]: 72, // Ruby 2.7.0
        [ProgrammingLanguage.SWIFT]: 83, // Swift 5.2.3
        [ProgrammingLanguage.KOTLIN]: 78, // Kotlin 1.3.70
        [ProgrammingLanguage.TYPESCRIPT]: 74, // TypeScript 3.7.4
    };

    // Mapping từ Judge0 status_id sang SubmissionStatus enum
    private readonly statusMapping: Record<number, SubmissionStatus> = {
        1: SubmissionStatus.IN_QUEUE,
        2: SubmissionStatus.PROCESSING,
        3: SubmissionStatus.ACCEPTED,
        4: SubmissionStatus.WRONG_ANSWER,
        5: SubmissionStatus.TIME_LIMIT_EXCEEDED,
        6: SubmissionStatus.COMPILE_ERROR,
        7: SubmissionStatus.RUNTIME_ERROR_SIGSEGV,
        8: SubmissionStatus.RUNTIME_ERROR_SIGXFSZ,
        9: SubmissionStatus.RUNTIME_ERROR_SIGFPE,
        10: SubmissionStatus.RUNTIME_ERROR_SIGABRT,
        11: SubmissionStatus.RUNTIME_ERROR_NZEC,
        12: SubmissionStatus.RUNTIME_ERROR_OTHER,
        13: SubmissionStatus.INTERNAL_ERROR,
        14: SubmissionStatus.EXEC_FORMAT_ERROR,
    };

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>(
            "JUDGE0_BASE_URL",
            "https://judge0.ript.vn",
        );
        this.authToken = this.configService.get<string>("JUDGE0_AUTH_TOKEN");
    }

    /**
     * Gửi submission đến Judge0
     */
    async submitCode(
        request: Judge0SubmissionRequest,
        customApiUrl?: string,
    ): Promise<Judge0SubmissionResponse> {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            if (this.authToken) {
                headers["X-Auth-Token"] = this.authToken;
            }

            const baseUrl = customApiUrl || this.baseUrl;
            const apiUrl = `${baseUrl}/submissions`;
            this.logger.log(`Sending request to Judge0 API: ${apiUrl}`);
            this.logger.log(`Request headers: ${JSON.stringify(headers)}`);
            this.logger.log(`Request language_id: ${request.language_id}`);
            this.logger.log(
                `Request source code length: ${request.source_code.length} characters`,
            );

            if (request.stdin) {
                this.logger.log(`Request stdin: ${request.stdin}`);
            }

            if (request.expected_output) {
                this.logger.log(
                    `Request expected_output: ${request.expected_output}`,
                );
            }

            const response = await firstValueFrom(
                this.httpService.post(apiUrl, request, {
                    headers,
                }),
            );

            this.logger.log(`Judge0 API response status: ${response.status}`);
            this.logger.log(`Judge0 submission token: ${response.data.token}`);

            if (response.data.status) {
                this.logger.log(
                    `Judge0 initial status: ${JSON.stringify(response.data.status)}`,
                );
            }

            return response.data;
        } catch (error) {
            this.logger.error(`Error submitting to Judge0: ${error.message}`);
            this.logger.error(`Error stack: ${error.stack}`);

            if (error.response) {
                this.logger.error(
                    `Judge0 error response status: ${error.response.status}`,
                );
                this.logger.error(
                    `Judge0 error response data: ${JSON.stringify(error.response.data)}`,
                );
            }

            throw new HttpException(
                "Failed to submit code to Judge0",
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    /**
     * Lấy kết quả submission từ Judge0
     */
    async getSubmissionResult(
        token: string,
        customApiUrl?: string,
    ): Promise<Judge0SubmissionResponse> {
        try {
            const headers: Record<string, string> = {};

            if (this.authToken) {
                headers["X-Auth-Token"] = this.authToken;
            }

            const baseUrl = customApiUrl || this.baseUrl;
            const apiUrl = `${baseUrl}/submissions/${token}`;
            this.logger.log(
                `Getting submission result from Judge0 API: ${apiUrl}`,
            );

            const response = await firstValueFrom(
                this.httpService.get(apiUrl, {
                    headers,
                }),
            );

            this.logger.log(
                `Judge0 get result API response status: ${response.status}`,
            );

            if (response.data.status) {
                this.logger.log(
                    `Judge0 submission status: ${JSON.stringify(response.data.status)}`,
                );
                this.logger.log(
                    `Judge0 submission time: ${response.data.time || "N/A"}`,
                );
                this.logger.log(
                    `Judge0 submission memory: ${response.data.memory || "N/A"}`,
                );
            }

            if (response.data.stdout) {
                this.logger.log(
                    `Judge0 submission stdout: ${response.data.stdout}`,
                );
            }

            if (response.data.stderr) {
                this.logger.log(
                    `Judge0 submission stderr: ${response.data.stderr}`,
                );
            }

            if (response.data.compile_output) {
                this.logger.log(
                    `Judge0 submission compile_output: ${response.data.compile_output}`,
                );
            }

            return response.data;
        } catch (error) {
            this.logger.error(
                `Error getting submission result: ${error.message}`,
            );

            this.logger.error(`Error stack: ${error.stack}`);

            if (error.response) {
                this.logger.error(
                    `Judge0 error response status: ${error.response.status}`,
                );
                this.logger.error(
                    `Judge0 error response data: ${JSON.stringify(error.response.data)}`,
                );
            }

            throw new HttpException(
                "Failed to get submission result from Judge0",
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    /**
     * Lấy danh sách ngôn ngữ được hỗ trợ
     */
    async getLanguages(): Promise<Judge0Language[]> {
        try {
            const headers: Record<string, string> = {};

            if (this.authToken) {
                headers["X-Auth-Token"] = this.authToken;
            }

            const response = await firstValueFrom(
                this.httpService.get(`${this.baseUrl}/languages`, { headers }),
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error getting languages: ${error.message}`);
            throw new HttpException(
                "Failed to get languages from Judge0",
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    /**
     * Lấy thông tin cấu hình Judge0
     */
    async getConfiguration(customApiUrl?: string): Promise<any> {
        try {
            const headers: Record<string, string> = {};

            if (this.authToken) {
                headers["X-Auth-Token"] = this.authToken;
            }

            const baseUrl = customApiUrl || this.baseUrl;
            const apiUrl = `${baseUrl}/config_info`;
            this.logger.log(`Getting Judge0 configuration from: ${apiUrl}`);

            const response = await firstValueFrom(
                this.httpService.get(apiUrl, {
                    headers,
                }),
            );

            this.logger.log(
                `Judge0 config API response status: ${response.status}`,
            );
            this.logger.log(
                `Judge0 version: ${response.data.version || "Unknown"}`,
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error getting configuration: ${error.message}`);
            this.logger.error(`Error stack: ${error.stack}`);

            if (error.response) {
                this.logger.error(
                    `Judge0 error response status: ${error.response.status}`,
                );
                this.logger.error(
                    `Judge0 error response data: ${JSON.stringify(error.response.data || {})}`,
                );
            } else if (error.request) {
                this.logger.error(
                    "Judge0 no response received - connection issue",
                );
            } else {
                this.logger.error("Judge0 request setup error");
            }

            throw new HttpException(
                "Failed to get configuration from Judge0",
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    /**
     * Chuyển đổi ProgrammingLanguage sang Judge0 language_id
     */
    getLanguageId(language: ProgrammingLanguage): number {
        const languageId = this.languageMapping[language];
        if (!languageId) {
            throw new HttpException(
                `Unsupported programming language: ${language}`,
                HttpStatus.BAD_REQUEST,
            );
        }
        return languageId;
    }

    /**
     * Chuyển đổi Judge0 status_id sang SubmissionStatus
     */
    getSubmissionStatus(statusId: number): SubmissionStatus {
        return this.statusMapping[statusId] || SubmissionStatus.INTERNAL_ERROR;
    }

    /**
     * Kiểm tra xem submission đã hoàn thành chưa
     */
    isSubmissionCompleted(statusId: number): boolean {
        return statusId >= 3; // Status 3 trở lên là đã hoàn thành
    }

    /**
     * Tính điểm dựa trên kết quả Judge0
     */
    calculateScore(
        status: SubmissionStatus,
        testCasesPassed: number,
        totalTestCases: number,
    ): number {
        if (status === SubmissionStatus.ACCEPTED) {
            return 100;
        } else if (status === SubmissionStatus.WRONG_ANSWER) {
            return (testCasesPassed / totalTestCases) * 100;
        } else {
            return 0;
        }
    }
}
