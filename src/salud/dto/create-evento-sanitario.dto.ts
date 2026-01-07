import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateEventoSanitarioDto {
    @IsString()
    id_animal: string;

    @IsDateString()
    fecha: string;

    @IsOptional()
    @IsString()
    id_enfermedad?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;
}
