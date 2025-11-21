import { ClientCommonQuery } from "@common/constant/class/client-common-query";
import { CommonQueryDto } from "@common/dto/common-query.dto";
import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class RequestQueryPipe
    implements PipeTransform<ClientCommonQuery, Promise<CommonQueryDto>>
{
    async transform(value: ClientCommonQuery): Promise<CommonQueryDto> {
        const param = plainToClass(ClientCommonQuery, value);
        const errors = await validate(param);
        if (errors.length > 0) {
            throw new BadRequestException("Invalid client query");
        }

        const { select, sort, limit, page, skip, filters, population } = value;
        try {
            const parsedPage = page && parseInt(page, 10);
            const parsedLimit = limit && parseInt(limit, 10);
            const parsedSkip = skip && parseInt(skip, 10);
            const calculatedSkip =
                parsedSkip ??
                (parsedPage && parsedLimit && (parsedPage - 1) * parsedLimit);

            const parsedSelect =
                select &&
                select.split(/[,\s]+/).reduce((selectOpts, field) => {
                    const trimmedField = field.trim();
                    if (!trimmedField) return selectOpts;

                    // Chuyển đổi 'id' thành '_id' nếu là field id
                    const normalizedField =
                        trimmedField === "id" ? "_id" : trimmedField;

                    const remove = normalizedField.startsWith("-");
                    if (remove) {
                        const newField = normalizedField.substring(1);
                        selectOpts[newField] = 0;
                    } else {
                        selectOpts[normalizedField] = 1;
                    }
                    return selectOpts;
                }, {});

            // Parse sort: có thể là JSON string hoặc field name đơn giản
            let parsedSort: any = {};
            if (sort) {
                try {
                    // Thử parse như JSON trước
                    parsedSort = JSON.parse(sort);
                } catch (e) {
                    // Nếu không phải JSON, coi như là field name đơn giản
                    // Sắp xếp tăng dần (1) nếu không có dấu -, giảm dần (-1) nếu có dấu -
                    if (sort.startsWith("-")) {
                        parsedSort[sort.substring(1)] = -1;
                    } else {
                        parsedSort[sort] = 1;
                    }
                }
            }
            if (!("_id" in parsedSort)) {
                Object.assign(parsedSort, { _id: -1 });
            }

            // Parse filters: có thể là string JSON array hoặc array of strings
            let parsedFilters: any[] = [];
            if (filters) {
                if (Array.isArray(filters)) {
                    // Nếu là array, kiểm tra phần tử đầu tiên có phải là JSON array string không
                    if (
                        filters.length === 1 &&
                        typeof filters[0] === "string"
                    ) {
                        try {
                            // Thử parse phần tử đầu tiên như JSON array
                            const parsed = JSON.parse(filters[0]);
                            parsedFilters = Array.isArray(parsed)
                                ? parsed
                                : [parsed];
                        } catch (e) {
                            // Nếu không phải JSON array, parse từng phần tử như filter object
                            parsedFilters = filters.map((filter) => {
                                if (typeof filter === "string") {
                                    try {
                                        return JSON.parse(filter);
                                    } catch (e) {
                                        return filter;
                                    }
                                }
                                return filter;
                            });
                        }
                    } else {
                        // Nếu có nhiều phần tử, parse từng phần tử
                        parsedFilters = filters.map((filter) => {
                            if (typeof filter === "string") {
                                try {
                                    return JSON.parse(filter);
                                } catch (e) {
                                    return filter;
                                }
                            }
                            return filter;
                        });
                    }
                } else if (typeof filters === "string") {
                    // Nếu là string (trường hợp hiếm), thử parse như JSON array
                    try {
                        const parsed = JSON.parse(filters);
                        parsedFilters = Array.isArray(parsed)
                            ? parsed
                            : [parsed];
                    } catch (e) {
                        // Nếu không parse được, coi như là một filter đơn
                        parsedFilters = [JSON.parse(filters)];
                    }
                }
            }

            // Parse population: có thể là string JSON array hoặc array of strings
            let parsedPopulation: any[] | undefined = undefined;
            if (population) {
                if (typeof population === "string") {
                    try {
                        const parsed = JSON.parse(population);
                        parsedPopulation = Array.isArray(parsed)
                            ? parsed
                            : [parsed];
                    } catch (e) {
                        parsedPopulation = [JSON.parse(population)];
                    }
                } else if (Array.isArray(population)) {
                    parsedPopulation = population.map((item) => {
                        if (typeof item === "string") {
                            try {
                                return JSON.parse(item);
                            } catch (e) {
                                return item;
                            }
                        }
                        return item;
                    });
                }
            }
            const res: CommonQueryDto = {
                page: parsedPage,
                limit: parsedLimit,
                skip: calculatedSkip,
                select: parsedSelect,
                sort: parsedSort,
                filters: parsedFilters,
                population: parsedPopulation,
            };
            return res;
        } catch (err) {
            console.error(err);
            throw new BadRequestException("Error parsing client query");
        }
    }
}
