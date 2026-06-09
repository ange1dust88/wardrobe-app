import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { SeasonPalette, SeasonWear, Vibe } from '../../items/dto/item.dto';

export class SuggestMatchesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  itemIds!: string[];

  @IsOptional()
  @IsEnum(SeasonWear)
  season?: SeasonWear;

  @IsOptional()
  @IsEnum(SeasonPalette)
  userColorType?: SeasonPalette;

  @IsOptional()
  @IsArray()
  @IsEnum(Vibe, { each: true })
  vibe?: Vibe[];
}
