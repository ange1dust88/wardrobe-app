import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  page?: string;
}
