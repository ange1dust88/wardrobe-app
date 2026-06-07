import { PartialType } from '@nestjs/mapped-types';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Item } from '../../items/dto/item.dto';

export class CreateOutfitDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  itemIds!: string[];
}

export class UpdateOutfitDto extends PartialType(CreateOutfitDto) {}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: string;
}

export interface OutfitWithItems extends Outfit {
  items: Item[];
}
