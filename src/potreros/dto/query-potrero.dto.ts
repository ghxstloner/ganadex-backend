import { IsString, IsOptional } from 'class-validator';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryPotreroDto extends QueryPaginationDto {
  @IsOptional()
  @IsString()
  id_finca?: string;
}
