import { PartialType } from '@nestjs/swagger';
import { CreateIdentificacionDto } from './create-identificacion.dto';

export class UpdateIdentificacionDto extends PartialType(
  CreateIdentificacionDto,
) {}
