import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { Climate, SeasonPalette, Who } from '@prisma/client';

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
}
