import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhotoController } from './photo/photo.controller';
import { PhotoService } from './photo/photo.service';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
    imports: [ConfigModule.forRoot({ envFilePath: ['.env.local'] })],
    controllers: [AppController, PhotoController, UsersController],
    providers: [AppService, PhotoService, UsersService],
})
export class AppModule {}
