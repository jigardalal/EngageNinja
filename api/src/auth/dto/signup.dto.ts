import { IsEmail, IsOptional, IsString, IsStrongPassword, MaxLength } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  tenantName?: string;
}
