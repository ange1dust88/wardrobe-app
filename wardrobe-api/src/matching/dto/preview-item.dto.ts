import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Category,
  Fit,
  Formality,
  Pattern,
  SeasonWear,
} from '../../items/dto/item.dto';

export class PreviewItemDto {
  @IsEnum(Category)
  category: Category;

  @IsHexColor()
  hex: string;

  @IsOptional()
  @IsHexColor()
  accentHex?: string;

  @IsEnum(Pattern)
  pattern: Pattern;

  @IsOptional()
  @IsString()
  subType?: string;

  @IsOptional()
  @IsEnum(Formality)
  formality?: Formality;

  @IsOptional()
  @IsEnum(Fit)
  fit?: Fit;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(SeasonWear, { each: true })
  seasonWear: SeasonWear[];

  @IsOptional()
  @IsString()
  excludeId?: string;
}
