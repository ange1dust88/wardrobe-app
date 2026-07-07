import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

function toBool({ value }: { value: unknown }): unknown {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}

function toArray({ value }: { value: unknown }): unknown[] {
  if (Array.isArray(value)) {
    return value as unknown[];
  }
  if (value === undefined || value === null || value === '') {
    return [];
  }
  return [value];
}

export enum Category {
  Headwear = 'headwear',
  Top = 'top',
  Outerwear = 'outerwear',
  Dress = 'dress',
  Bottom = 'bottom',
  Shoes = 'shoes',
  Accessory = 'accessory',
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

export enum SeasonWear {
  Spring = 'spring',
  Summer = 'summer',
  Autumn = 'autumn',
  Winter = 'winter',
}

export enum Formality {
  Loungewear = 'loungewear',
  Casual = 'casual',
  SmartCasual = 'smart_casual',
  Formal = 'formal',
}

export enum Fit {
  Slim = 'slim',
  Regular = 'regular',
  Relaxed = 'relaxed',
  Oversized = 'oversized',
}

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsString()
  subType?: string;

  @IsOptional()
  @IsHexColor()
  hex?: string;

  @IsOptional()
  @IsHexColor()
  accentHex?: string;

  @IsEnum(Pattern)
  pattern: Pattern;

  @IsOptional()
  @IsEnum(Formality)
  formality?: Formality;

  @IsOptional()
  @IsEnum(Fit)
  fit?: Fit;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  excluded?: boolean;

  @Transform(toArray)
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(SeasonWear, { each: true })
  seasonWear: SeasonWear[];
}

export class UpdateItemDto extends PartialType(CreateItemDto) {}

export interface Color {
  hex: string;
  hue: number;
  temperature: Temperature;
  brightness: Brightness;
  saturation: Saturation;
  isNeutral: boolean;
}

export interface Item {
  id: string;
  createdAt: string;
  name: string;
  category: Category;
  subType: string | null;
  color: Color;
  accent: Color | null;
  wardrobeRole: WardrobeRole;
  imageUrl: string | null;
  pattern: Pattern;
  formality: Formality | null;
  fit: Fit | null;
  excluded: boolean;
  seasonPaletteCompatibility: SeasonPalette[];
  seasonWear: SeasonWear[];
}
