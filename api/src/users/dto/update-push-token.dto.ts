import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdatePushTokenDto {
  // Allow `null` to let the client clear a previously stored token
  // (e.g. when the user revokes notification permission or logs out on this device).
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @IsOptional()
  expoPushToken: string | null;
}
