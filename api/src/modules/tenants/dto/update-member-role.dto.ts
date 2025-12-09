import { IsEnum } from 'class-validator';
import { TenantRole } from './invite-tenant-member.dto';

export class UpdateMemberRoleDto {
  @IsEnum(TenantRole)
  role!: TenantRole;
}
