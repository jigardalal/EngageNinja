import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum TenantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MARKETER = 'marketer',
  AGENCY_MARKETER = 'agency_marketer',
  VIEWER = 'viewer',
}

export class InviteTenantMemberDto {
  @IsEmail()
  email!: string;

  @IsEnum(TenantRole)
  role!: TenantRole;

  @IsOptional()
  @IsString()
  message?: string;
}
