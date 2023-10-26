import { Controller, Get, Param } from '@nestjs/common';
import { PhotoService } from './photo.service';

@Controller('photo')
export class PhotoController {
    constructor(private readonly photoService: PhotoService) {}

    @Get('buckets')
    async getBuckets() {
        return await this.photoService.getBuckets();
    }

    @Get('bucket/:bucketId')
    async getFilesForBucket(@Param('bucketId') bucketId: string) {
        return await this.photoService.getFilesForBucket(bucketId);
    }

    @Get('zip/:bucketId')
    async createZipForBucket(@Param('bucketId') bucketId: string) {
        return await this.photoService.zipFilesForBucket(bucketId);
    }

    @Get('resize/:bucketId/:imageId')
    async resizeImage(@Param('bucketId') bucketId: string, @Param('imageId') imageId: string) {
        return await this.photoService.resizeImage(bucketId, imageId);
    }
}
