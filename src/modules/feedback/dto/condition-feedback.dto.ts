import { PartialType } from "@nestjs/mapped-types";
import { Feedback } from "../entities/feedback.entity";

export class ConditionFeedbackDto extends PartialType(Feedback) {}
