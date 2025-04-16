import { Injectable } from '@nestjs/common';
const { UploadClient } = require('@uploadcare/upload-client')
@Injectable()
export class S3Service {
  async AddNewSight(fileBody: any) {
    const buffer = Buffer.from(fileBody);
    const client = new UploadClient({ publicKey: process.env.S3_PUBLIC_KEY, secretKey: process.env.S3_SECRET_KEY });
    var file = await client.uploadFile(buffer, {
      store: true,
    });
    return file.uuid
  }
  async EditSight(fileBody: any, fileUUid: any) {
    const res = await fetch(`https://api.uploadcare.com/files/${fileUUid}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Uploadcare.Simple ${process.env.S3_PUBLIC_KEY}:${process.env.S3_SECRET_KEY}`,
      }
    })
    const buffer = Buffer.from(fileBody);
    const client = new UploadClient({ publicKey: process.env.S3_PUBLIC_KEY, secretKey: process.env.S3_SECRET_KEY });
    var file = await client.uploadFile(buffer, {
      store: true,
    });
    return file.uuid
  }
}