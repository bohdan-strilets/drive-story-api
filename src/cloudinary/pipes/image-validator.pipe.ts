import {
  FileTypeValidator,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

const allowedFileTypes = /(jpg|jpeg|png|webp)/;
const maxSize = 8 * 1024 * 1024;

export const imageValidator = new ParseFilePipe({
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  fileIsRequired: true,
  validators: [
    new MaxFileSizeValidator({ maxSize }),
    new FileTypeValidator({ fileType: allowedFileTypes }),
  ],
});
