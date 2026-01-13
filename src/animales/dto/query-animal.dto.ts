import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { QueryPaginationDto } from '../../common/dto/query-pagination.dto';

export class QueryAnimalDto extends QueryPaginationDto {
  @IsOptional()
  @IsString()
  id_finca?: string;

  @IsOptional()
  @IsString()
  id_lote?: string;

  @IsOptional()
  @Transform(({ value }) => {
    // Convert friendly values to database values
    if (value === 'macho' || value === 'M') return 'M';
    if (value === 'hembra' || value === 'F') return 'F';
    return value;
  })
  @IsIn(['M', 'F', 'macho', 'hembra'])
  sexo?: 'M' | 'F' | 'macho' | 'hembra';

  @IsOptional()
  @IsString()
  id_categoria?: string;

  @IsOptional()
  @IsString()
  id_estado?: string;

  // Alias for id_estado to support 'estado' parameter from frontend
  @IsOptional()
  @Transform(({ value, obj }) => {
    // If estado is provided, use it as id_estado
    if (value !== undefined && value !== null) {
      obj.id_estado = value;
    }
    return undefined; // Don't store estado separately
  })
  estado?: string;

  @IsOptional()
  @IsString()
  id_raza?: string;

  @IsOptional()
  @IsString()
  id_color_pelaje?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento_desde?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento_hasta?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  con_padre?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  con_madre?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  solo_activos?: boolean;
}
