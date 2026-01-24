import { IsDateString, IsOptional, IsString } from 'class-validator';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryAnimalMovimientosDto extends QueryPaginationDto {
  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;

  @IsOptional()
  @IsString()
  tipo?: string;
}
