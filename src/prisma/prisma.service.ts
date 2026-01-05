import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import path from 'node:path';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const prismaPackagePath = path.join(process.cwd(), 'generated/prisma');
const prismaPackage = require(prismaPackagePath) as typeof import('../../generated/prisma');
const PrismaClientClass: new (options?: unknown) => import('../../generated/prisma').PrismaClient =
  prismaPackage.PrismaClient;

@Injectable()
export class PrismaService
  extends PrismaClientClass
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = process.env.DATABASE_URL ?? '';
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }
    const adapter = PrismaService.createAdapter(databaseUrl);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private static createAdapter(databaseUrl: string) {
    const url = new URL(databaseUrl);
    const protocol = url.protocol.replace(':', '');
    if (protocol !== 'mysql' && protocol !== 'mariadb') {
      throw new Error('DATABASE_URL must be mysql or mariadb');
    }

    const connectionLimitParam = url.searchParams.get('connection_limit');
    const connectionLimit = connectionLimitParam
      ? Number(connectionLimitParam)
      : 5;
    const database = url.pathname.replace('/', '');

    return new PrismaMariaDb({
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database,
      connectionLimit,
    });
  }
}
