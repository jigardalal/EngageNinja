import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

export class SendWhatsAppDto {
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  @IsString()
  templateId?: string;
}
