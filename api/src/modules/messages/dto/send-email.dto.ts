import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

export class SendEmailDto {
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @IsString()
  @MinLength(1)
  subject: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsString()
  templateId?: string;
}
