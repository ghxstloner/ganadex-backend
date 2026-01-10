import { PartialType } from '@nestjs/swagger';
import { CreateEventoReproductivoDto } from './create-evento-reproductivo.dto';

export class UpdateEventoReproductivoDto extends PartialType(
  CreateEventoReproductivoDto,
) {}
