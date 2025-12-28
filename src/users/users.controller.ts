import { Body, Controller, Post, Put, Param, Get, Query, UploadedFiles, UnsupportedMediaTypeException, UseInterceptors, Patch, Req } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join, relative } from 'path';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateFeesDto } from './dto/update-fees.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApprovalNotesDto } from './dto/approval-notes.dto';
import { RejectUserDto } from './dto/reject-user.dto';
import { User } from './user.entity';
import { DocumentUploadPaths, UsersService } from './users.service';
import { VerificationService } from '../verification/verification.service';
import { Public } from '../auth/public.decorator';
import { CurrentUser } from '../auth/user.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationService: VerificationService,
  ) {}

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
  async createUser(@Body() payload: CreateUserDto, @UploadedFiles() files?: UploadedDocumentFiles, @Req() req?: Request) {
    const documentPaths = this.extractDocumentPaths(files || {});
    const user = await this.usersService.createUser(payload, documentPaths);
    return this.toResponse(user, req);
  }

  @Put(':id/fees')
  async updateFees(@Param('id') id: string, @Body() updateFeesDto: UpdateFeesDto, @Req() req?: Request) {
    const user = await this.usersService.updateFees(id, updateFeesDto);
    return this.toResponse(user, req);
  }

  @Get('sellers/pending')
  async getPendingSellers(@Query('page') page?: string, @Query('limit') limit?: string, @Req() req?: Request) {
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '10');
    const result = await this.usersService.getPendingSellers(pageNum, limitNum);
    
    return {
      sellers: result.sellers.map(user => this.toResponse(user, req)),
      pagination: result.pagination,
    };
  }

  @Get()
  async getUsers(
    @Req() req: Request,
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
      users: result.users.map(user => this.toResponse(user, req)),
      pagination: result.pagination,
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Req() req?: Request) {
    const user = await this.usersService.findById(id);
    return this.toResponse(user, req);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto, @Req() req?: Request) {
    const user = await this.usersService.updateStatus(id, updateStatusDto.status, { notes: updateStatusDto.notes });
    return this.toResponse(user, req);
  }

  @Patch(':id/approve')
  async approveUser(@Param('id') id: string, @Body() approvalNotesDto: ApprovalNotesDto, @Req() req?: Request) {
    const user = await this.usersService.updateStatus(id, 'approved', { notes: approvalNotesDto?.notes });
    return this.toResponse(user, req);
  }

  @Patch(':id/reject')
  async rejectUser(@Param('id') id: string, @Body() rejectUserDto: RejectUserDto, @Req() req?: Request) {
    const user = await this.usersService.updateStatus(id, 'rejected', { notes: rejectUserDto.notes });
    return this.toResponse(user, req);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto, @Req() req?: Request) {
    const user = await this.usersService.updateStatus(id, body.status, { notes: body.notes });
    return this.toResponse(user, req);
  }

  @Get('me/rejected-documents')
  async getMyRejectedDocuments(@CurrentUser() user: any, @Req() req?: Request) {
    const rejectedInfo = await this.usersService.getUserRejectedDocuments(user.id);
    
    // Build URLs for available documents
    const documentUrls = {};
    rejectedInfo.availableDocuments.forEach(doc => {
      documentUrls[doc.type] = this.buildFileUrl(doc.path, req);
    });
    
    return {
      ...rejectedInfo,
      documentsUrls: documentUrls,
    };
  }

  @Post('verify-email')
  @Public()
  async verifyEmailCode(@Body() body: { email: string; code: string }) {
    const isValid = await this.verificationService.verifyCode(body.email, body.code);
    return { verified: isValid };
  }

  @Post('resend-verification')
  @Public()
  async resendVerificationCode(@Body() body: { email: string }) {
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      return { message: 'Se o email existir, um código será enviado.' };
    }
    
    await this.verificationService.generateAndSendVerificationCode(body.email, user.name);
    return { message: 'Código enviado com sucesso.' };
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

  private toResponse(user: User, req?: Request) {
    const { password, ...rest } = user;
    return {
      ...rest,
      documents: this.buildDocumentsResponse(user.documents, req),
      documentFiles: this.buildDocumentFiles(user.documents, req),
      publicKey: user.publicKey,
      secretKey: user.secretKey,
    };
  }

  private buildDocumentsResponse(documents: User['documents'], req?: Request) {
    if (!documents) {
      return undefined;
    }
    const pf = documents.pf
      ? {
          ...documents.pf,
          documentFront: this.buildFileUrl(documents.pf.documentFront, req),
          documentBack: this.buildFileUrl(documents.pf.documentBack, req),
          selfieWithDocument: this.buildFileUrl(documents.pf.selfieWithDocument, req),
          bankProof: this.buildFileUrl(documents.pf.bankProof, req),
        }
      : undefined;

    const pj = documents.pj
      ? {
          ...documents.pj,
          legalRepresentativeDocumentFront: this.buildFileUrl(documents.pj.legalRepresentativeDocumentFront, req),
          legalRepresentativeDocumentBack: this.buildFileUrl(documents.pj.legalRepresentativeDocumentBack, req),
          legalRepresentativeSelfie: this.buildFileUrl(documents.pj.legalRepresentativeSelfie, req),
          bankProof: this.buildFileUrl(documents.pj.bankProof, req),
          cnpjDocument: this.buildFileUrl(documents.pj.cnpjDocument, req),
        }
      : undefined;

    return {
      ...documents,
      pf,
      pj,
    };
  }

  private buildFileUrl(filePath?: string, req?: Request): string | undefined {
    if (!filePath) {
      return undefined;
    }

    if (/^https?:\/\//i.test(filePath)) {
      return filePath;
    }

    const sanitizedPath = filePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const baseUrl = this.getBaseUrl(req);
    return `${baseUrl}/${sanitizedPath}`;
  }

  private getBaseUrl(req?: Request): string {
    const configuredBase = process.env.FILE_BASE_URL || process.env.APP_URL;
    if (configuredBase) {
      return configuredBase.replace(/\/+$/, '');
    }

    if (req) {
      const protocol = req.protocol;
      const host = req.get('host');
      if (host) {
        return `${protocol}://${host}`.replace(/\/+$/, '');
      }
    }

    const port = process.env.PORT || '3000';
    return `http://localhost:${port}`.replace(/\/+$/, '');
  }

  private buildDocumentFiles(documents?: User['documents'], req?: Request) {
    return {
      pfDocumentFront: this.buildFileUrl(documents?.pf?.documentFront, req) ?? null,
      pfDocumentBack: this.buildFileUrl(documents?.pf?.documentBack, req) ?? null,
      pfSelfieDocument: this.buildFileUrl(documents?.pf?.selfieWithDocument, req) ?? null,
      pfBankProof: this.buildFileUrl(documents?.pf?.bankProof, req) ?? null,
      pjLegalRepresentativeDocumentFront: this.buildFileUrl(documents?.pj?.legalRepresentativeDocumentFront, req) ?? null,
      pjLegalRepresentativeDocumentBack: this.buildFileUrl(documents?.pj?.legalRepresentativeDocumentBack, req) ?? null,
      pjSelfieDocument: this.buildFileUrl(documents?.pj?.legalRepresentativeSelfie, req) ?? null,
      pjBankProof: this.buildFileUrl(documents?.pj?.bankProof, req) ?? null,
      pjCnpjDocument: this.buildFileUrl(documents?.pj?.cnpjDocument, req) ?? null,
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
