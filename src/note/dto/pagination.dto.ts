import { IsOptional, IsPositive, Min, IsString, IsIn, IsNumber } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  // @IsPositive({ message: 'limit must be a positive number' })
  limit?: number;

  @IsOptional()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}