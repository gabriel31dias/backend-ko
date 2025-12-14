import { Body, Controller, Post, Put, Param, Get, Query, UploadedFiles, UnsupportedMediaTypeException, UseInterceptors, Patch } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join, relative } from 'path';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFeesDto } from './dto/update-fees.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApprovalNotesDto } from './dto/approval-notes.dto';
import { RejectUserDto } from './dto/reject-user.dto';
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

  @Get('sellers/pending')
  async getPendingSellers(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');
    const result = await this.usersService.getPendingSellers(pageNum, limitNum);
    
    return {
      sellers: result.sellers.map(user => this.toResponse(user)),
      pagination: result.pagination,
    };
  }

  @Get()
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const parsedPage = parseInt(page ?? '1', 10);
    const parsedLimit = parseInt(limit ?? '10', 10);
    const pageNum = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);
    const limitNum = Number.isNaN(parsedLimit) ? 10 : Math.max(parsedLimit, 1);
    const result = await this.usersService.getUsers({ page: pageNum, limit: limitNum, status, search });

    return {
      users: result.users.map(user => this.toResponse(user)),
      pagination: result.pagination,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return this.toResponse(user);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    const user = await this.usersService.updateStatus(id, updateStatusDto.status, { notes: updateStatusDto.notes });
    return this.toResponse(user);
  }

  @Patch(':id/approve')
  async approveUser(@Param('id') id: string, @Body() approvalNotesDto: ApprovalNotesDto) {
    const user = await this.usersService.updateStatus(id, 'approved', { notes: approvalNotesDto?.notes });
    return this.toResponse(user);
  }

  @Patch(':id/reject')
  async rejectUser(@Param('id') id: string, @Body() rejectUserDto: RejectUserDto) {
    const user = await this.usersService.updateStatus(id, 'rejected', { notes: rejectUserDto.notes });
    return this.toResponse(user);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    const user = await this.usersService.updateStatus(id, body.status, { notes: body.notes });
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
