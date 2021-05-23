import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemsModule } from './items/items.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TerminalGateway } from './terminal/terminal.gateway';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useCreateIndex: true
      }),
      inject: [ConfigService],
    }),
    ItemsModule,
    CategoriesModule,
    TransactionsModule,
    AuthModule,
  ],
  controllers: [
  ],
  providers: [
    TerminalGateway
  ],
})
export class AppModule {}
