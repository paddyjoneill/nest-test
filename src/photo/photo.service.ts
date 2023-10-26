import { Injectable } from '@nestjs/common';
import { ListBucketsCommand, GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ConfigService } from '@nestjs/config';
import archiver from 'archiver';
import * as stream from 'stream';
import sharp from 'sharp';

type Readable = stream.Readable;

@Injectable()
export class PhotoService {
    private readonly s3: S3Client;

    constructor(private configService: ConfigService) {
        const credentials = {
            accessKeyId: this.configService.get<string>('CLOUDFLARE_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>('CLOUDFLARE_SECRET_ACCESS_KEY'),
        };

        this.s3 = new S3Client({
            region: 'auto',
            endpoint: `https://${this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
            credentials,
        });
    }

    async getBuckets(): Promise<string[]> {
        const command = new ListBucketsCommand({});
        const { Buckets } = await this.s3.send(command);
        return Buckets.map((b) => b.Name);
    }

    async getFilesForBucket(bucket: string) {
        const command = new ListObjectsV2Command({ Bucket: bucket });
        const { Contents } = await this.s3.send(command);
        return Contents?.map((c) => ({ fileName: c.Key, size: c.Size })) ?? [];
    }

    async zipFilesForBucket(bucketId: string) {
        const passThroughStream = new stream.PassThrough();
        const archive = archiver('zip', {
            zlib: { level: 9 },
        });
        try {
            const upload = new Upload({
                client: this.s3,
                params: {
                    Bucket: bucketId,
                    Key: `archive${(Math.random() * 1000).toFixed(0)}.zip`,
                    Body: passThroughStream,
                },
                queueSize: 4, // optional concurrency configuration
                partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
                leavePartsOnError: false, // optional manually handle dropped parts
            });
            console.log('----------------uploading zip-----------------');
            const files = (await this.getFilesForBucket(bucketId)).filter((f) => !f.fileName.endsWith('zip'));
            let idx = 0;
            const noOfFiles = files.length;
            archive.pipe(passThroughStream);
            const addFile = async () => {
                if (idx >= noOfFiles) {
                    archive
                        .finalize()
                        .then(() => console.log('**************  archive finalised  ********************'));
                    return;
                }
                const filename = files[idx].fileName;
                const { Body } = await this.s3.send(new GetObjectCommand({ Bucket: bucketId, Key: filename }));
                const readableStream = Body as Readable;
                readableStream.on('close', () => addFile());
                archive.append(readableStream, { name: filename });
                idx++;
            };
            await addFile();
            upload.on('httpUploadProgress', ({ part }) => {
                console.log({ part });
            });
            await upload.done();
            console.log('----------------finished-----------------');
        } catch (e) {
            console.log(e);
        }
    }

    async resizeImage(bucket: string, imageId: string) {
        const converter = sharp().withMetadata().resize(800).jpeg({ mozjpeg: true, quality: 75 });

        const command = new GetObjectCommand({ Bucket: bucket, Key: imageId });
        const { Body } = await this.s3.send(command);
        const passThroughStream = new stream.PassThrough();
        const upload = new Upload({
            client: this.s3,
            params: {
                Bucket: bucket,
                Key: `resized_${imageId}`,
                Body: passThroughStream,
            },
            queueSize: 4, // optional concurrency configuration
            partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
            leavePartsOnError: false, // optional manually handle dropped parts
        });
        (Body as Readable).pipe(converter).pipe(passThroughStream);
        await upload.done();
    }
}
