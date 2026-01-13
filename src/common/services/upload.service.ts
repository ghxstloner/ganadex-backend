import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  async saveAnimalPhoto(
    empresaId: bigint,
    animalId: bigint,
    file: Express.Multer.File,
  ): Promise<string> {
    // Crear directorio si no existe: uploads/[empresa_id]/animales/
    const empresaDir = path.join(this.uploadsDir, empresaId.toString());
    const animalesDir = path.join(empresaDir, 'animales');

    await fs.mkdir(animalesDir, { recursive: true });

    // Nombre del archivo: animal_{id}.webp
    const fileName = `animal_${animalId.toString()}.webp`;
    const filePath = path.join(animalesDir, fileName);

    // Optimizar y convertir a WebP con alta calidad
    await sharp(file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(filePath);

    // Retornar la ruta relativa: uploads/[empresa_id]/animales/animal_{id}.webp
    return path.join('uploads', empresaId.toString(), 'animales', fileName);
  }

  async deleteAnimalPhoto(filePath: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // Ignorar si el archivo no existe
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
