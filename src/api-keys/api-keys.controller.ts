import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKeysPaginationQueryDto } from './dto/pagination-query.dto';
import { CurrentUser } from '../auth/user.decorator';
import { User } from '../users/user.entity';
import { ApiKeyResponse, PaginatedApiKeys } from './entities/api-key.entity';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createApiKeyDto: CreateApiKeyDto
  ): Promise<ApiKeyResponse> {
    return this.apiKeysService.create(user.id, createApiKeyDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query() query: ApiKeysPaginationQueryDto
  ): Promise<PaginatedApiKeys> {
    return this.apiKeysService.findAllPaginated(user.id, query);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string
  ): Promise<ApiKeyResponse> {
    return this.apiKeysService.findOne(user.id, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto
  ): Promise<ApiKeyResponse> {
    return this.apiKeysService.update(user.id, id, updateApiKeyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string
  ): Promise<void> {
    return this.apiKeysService.remove(user.id, id);
  }
}