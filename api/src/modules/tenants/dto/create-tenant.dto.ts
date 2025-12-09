import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { PlanTier } from '../../../common/enums/plan-tier.enum';

export class CreateTenantDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsEnum(PlanTier)
  planTier!: PlanTier;

  @IsString()
  @MaxLength(64)
  region!: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  capabilityFlags?: string[];
}
