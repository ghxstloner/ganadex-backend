import { PartialType } from '@nestjs/swagger';
import { CreatePotreroDto } from './create-potrero.dto';

export class UpdatePotreroDto extends PartialType(CreatePotreroDto) { }
