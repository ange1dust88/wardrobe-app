import { PartialType } from '@nestjs/mapped-types';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Item } from '../../items/dto/item.dto';

export class CreateOutfitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(60)
  @IsString({ each: true })
  itemIds!: string[];

  @IsOptional()
  @IsString()
  folderId?: string | null;
}

export class UpdateOutfitDto extends PartialType(CreateOutfitDto) {}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  folderId: string | null;
  createdAt: string;
}

export interface OutfitWithItems extends Outfit {
  items: Item[];
}
