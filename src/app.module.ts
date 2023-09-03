import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from './_common/typeorm.config';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientModule } from './client/client.module';
import { AccountModule } from './account/account.module';
import * as redisStore from 'cache-manager-redis-store';
import { IdentityModule } from './identity/identity.module';
import { TradeModule } from './trade/trade.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: ormConfig }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          store: redisStore,
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
          // password: process.env.REDIS_PASSWORD,
        };
      },
    }),
    ClientModule,
    IdentityModule,
    AccountModule,
    TradeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
