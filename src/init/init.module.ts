import { Module } from '@nestjs/common';
import { InitService } from './init.service';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    RolesModule,
    UsersModule,
    ConfigModule
  ],
  providers: [InitService],
})
export class InitModule {}