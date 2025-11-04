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

            const parsedFilters =
                (filters && filters.map((filter) => JSON.parse(filter))) || [];
            const parsedPopulation =
                population && population.map((item) => JSON.parse(item));
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
