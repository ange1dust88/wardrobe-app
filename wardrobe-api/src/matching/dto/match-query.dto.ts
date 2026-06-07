import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import {
  Category,
  SeasonPalette,
  SeasonWear,
  Vibe,
} from '../../items/dto/item.dto';

const toArray = ({ value }: { value: unknown }) =>
  value === undefined ? value : Array.isArray(value) ? value : [value];

export class MatchQueryDto {
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsEnum(SeasonWear)
  season?: SeasonWear;

  @IsOptional()
  @IsEnum(SeasonPalette)
  userColorType?: SeasonPalette;

  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsEnum(Vibe, { each: true })
  vibe?: Vibe[];
}
