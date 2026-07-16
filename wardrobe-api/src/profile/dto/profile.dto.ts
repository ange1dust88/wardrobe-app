import { IsArray, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Climate, SeasonPalette, Undertone, Who } from '@prisma/client';

export class UpsertProfileDto {
  @IsOptional()
  @IsEnum(Who)
  who?: Who;

  @IsOptional()
  @IsEnum(Climate)
  climate?: Climate;

  @IsOptional()
  @IsArray()
  @IsEnum(SeasonPalette, { each: true })
  palettes?: SeasonPalette[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  hair?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  eyes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  skin?: number;

  @IsOptional()
  @IsEnum(Undertone)
  undertone?: Undertone;
}
