import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemsModule } from './items/items.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TerminalGateway } from './terminal/terminal.gateway';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nanopos', {useCreateIndex: true}),
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
