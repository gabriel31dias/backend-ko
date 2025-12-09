import { Body, Controller, Post, Put, Param, UploadedFiles, UnsupportedMediaTypeException, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join, relative } from 'path';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFeesDto } from './dto/update-fees.dto';
import { User } from './user.entity';
import { DocumentUploadPaths, UsersService } from './users.service';
import { Public } from '../auth/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'pfDocumentFront', maxCount: 1 },
    { name: 'pfDocumentBack', maxCount: 1 },
    { name: 'pfSelfieDocument', maxCount: 1 },
    { name: 'pfBankProof', maxCount: 1 },
    { name: 'pjLegalRepresentativeDocumentFront', maxCount: 1 },
    { name: 'pjLegalRepresentativeDocumentBack', maxCount: 1 },
    { name: 'pjSelfieDocument', maxCount: 1 },
    { name: 'pjBankProof', maxCount: 1 },
    { name: 'pjCnpjDocument', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        ensureUploadDir();
        cb(null, USER_UPLOAD_DIR);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const extension = extname(file.originalname) || '';
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (isAllowedFile(file.mimetype)) {
        return cb(null, true);
      }
      cb(new UnsupportedMediaTypeException('Apenas imagens ou PDF são permitidos nos documentos.'), false);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async createUser(@Body() payload: CreateUserDto, @UploadedFiles() files?: UploadedDocumentFiles) {
    const documentPaths = this.extractDocumentPaths(files || {});
    const user = await this.usersService.createUser(payload, documentPaths);
    return this.toResponse(user);
  }

  @Put(':id/fees')
  async updateFees(@Param('id') id: string, @Body() updateFeesDto: UpdateFeesDto) {
    const user = await this.usersService.updateFees(id, updateFeesDto);
    return this.toResponse(user);
  }

  private extractDocumentPaths(files: UploadedDocumentFiles): DocumentUploadPaths {
    return {
      pfDocumentFront: this.resolveFilePath(files.pfDocumentFront),
      pfDocumentBack: this.resolveFilePath(files.pfDocumentBack),
      pfSelfieDocument: this.resolveFilePath(files.pfSelfieDocument),
      pfBankProof: this.resolveFilePath(files.pfBankProof),
      pjLegalRepresentativeDocumentFront: this.resolveFilePath(files.pjLegalRepresentativeDocumentFront),
      pjLegalRepresentativeDocumentBack: this.resolveFilePath(files.pjLegalRepresentativeDocumentBack),
      pjSelfieDocument: this.resolveFilePath(files.pjSelfieDocument),
      pjBankProof: this.resolveFilePath(files.pjBankProof),
      pjCnpjDocument: this.resolveFilePath(files.pjCnpjDocument),
    };
  }

  private resolveFilePath(fileArray?: StoredFile[]): string | undefined {
    const file = fileArray?.[0];
    if (!file) {
      return undefined;
    }
    if (file.path) {
      const relativePath = relative(process.cwd(), file.path);
      return relativePath || file.path;
    }
    return join('uploads', 'users', file.filename);
  }

  private toResponse(user: User) {
    const { password, ...rest } = user;
    return {
      ...rest,
      publicKey: user.publicKey,
      secretKey: user.secretKey,
    };
  }
}

type UploadedDocumentFiles = {
  [K in keyof DocumentUploadPaths]?: StoredFile[];
};

interface StoredFile {
  filename: string;
  path?: string;
}

const USER_UPLOAD_DIR = join(process.cwd(), 'uploads', 'users');

function ensureUploadDir() {
  if (!existsSync(USER_UPLOAD_DIR)) {
    mkdirSync(USER_UPLOAD_DIR, { recursive: true });
  }
}

function isAllowedFile(mimetype?: string) {
  if (!mimetype) {
    return false;
  }
  return mimetype.startsWith('image/') || mimetype === 'application/pdf';
}
