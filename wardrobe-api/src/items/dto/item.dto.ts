import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum Category {
  Outerwear = 'outerwear',
  Top = 'top',
  Bottom = 'bottom',
  Shoes = 'shoes',
  Accessory = 'accessory',
  Dress = 'dress',
  Set = 'set',
}

export enum Temperature {
  Warm = 'warm',
  Cool = 'cool',
  Neutral = 'neutral',
}

export enum Brightness {
  Light = 'light',
  Medium = 'medium',
  Dark = 'dark',
}

export enum Saturation {
  Muted = 'muted',
  Soft = 'soft',
  Vivid = 'vivid',
}

export enum WardrobeRole {
  Core = 'core',
  Tonal = 'tonal',
  Pop = 'pop',
}

export enum Pattern {
  Solid = 'solid',
  SubtlePattern = 'subtle_pattern',
  BoldPattern = 'bold_pattern',
  Graphic = 'graphic',
  TextureOnly = 'texture_only',
}

export enum SeasonPalette {
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
  Winter = 'winter',
  Universal = 'universal',
}

export enum Vibe {
  Casual = 'casual',
  Classic = 'classic',
  Romantic = 'romantic',
  Edgy = 'edgy',
  Sporty = 'sporty',
  Business = 'business',
  Evening = 'evening',
  Minimal = 'minimal',
}

export enum SeasonWear {
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
  Winter = 'winter',
  AllYear = 'all_year',
}

export class ColorDto {
  @IsHexColor()
  hex: string;

  @IsInt()
  @Min(0)
  @Max(360)
  hue: number;

  @IsEnum(Temperature)
  temperature: Temperature;

  @IsEnum(Brightness)
  brightness: Brightness;

  @IsEnum(Saturation)
  saturation: Saturation;

  @IsBoolean()
  isNeutral: boolean;
}

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Category)
  category: Category;

  @ValidateNested()
  @Type(() => ColorDto)
  color: ColorDto;

  @IsEnum(WardrobeRole)
  wardrobeRole: WardrobeRole;

  @IsEnum(Pattern)
  pattern: Pattern;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(SeasonPalette, { each: true })
  seasonPaletteCompatibility: SeasonPalette[];

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Vibe, { each: true })
  vibe: Vibe[];

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(SeasonWear, { each: true })
  seasonWear: SeasonWear[];
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}

export interface Item extends CreateItemDto {
  id: string;
  createdAt: string;
}
