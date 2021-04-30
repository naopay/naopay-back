import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { RegisteredGuard } from 'src/auth/guards/registered.guard';

@Controller('items')
@UseGuards(RegisteredGuard)
@ApiBearerAuth()
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiConsumes('application/json')
  @ApiOperation({ summary: 'Create a item' })
  async create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }

  @Delete(':id/:extraID')
  @ApiOperation({ summary: 'Remove an extra from an item' })
  removeExtra(@Param('id') id: string, @Param('extraID') extraID: string) {
    return this.itemsService.removeExtra(id, extraID);
  }
}
