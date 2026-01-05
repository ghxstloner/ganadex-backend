import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { trimOrUndefined } from '../../common/utils/trim-or-undefined';

export class EmpresaActivaDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/)
  @Transform(({ value }) => trimOrUndefined(value))
  empresa_id: string;
}
