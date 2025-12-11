import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

export class SendCampaignDto {
  @IsString()
  @MinLength(1)
  campaignId: string;

  @IsArray()
  @IsString({ each: true })
  recipientSegments: string[];

  @IsOptional()
  @IsString()
  scheduledTime?: string;

  @IsOptional()
  @IsString()
  messageOverride?: string;
}
