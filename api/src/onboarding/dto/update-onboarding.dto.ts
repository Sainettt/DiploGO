import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class UpdateOnBoardingDto {
  @IsString()
  @IsOptional()
  purpose?: string;

  @IsInt()
  @IsOptional()
  dailyTimeSpent?: number;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  onBoardingCompleted?: boolean;
}
