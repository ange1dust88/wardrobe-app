import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;
}

export class UpdateFolderDto extends PartialType(CreateFolderDto) {}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}
