import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateFolderDto extends PartialType(CreateFolderDto) {}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}
