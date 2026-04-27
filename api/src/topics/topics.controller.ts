import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { FormatTextDto } from './dto/format-text.dto';

@UseGuards(JwtGuard)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topics: TopicsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTopicDto) {
    return this.topics.create(req.user.sub, dto);
  }

  @Get()
  list(@Req() req: any) {
    return this.topics.list(req.user.sub);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.topics.findOne(req.user.sub, id);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.topics.remove(req.user.sub, id);
  }

  @Post('ai/generate')
  generate(@Body() dto: GenerateQuestionsDto) {
    return this.topics.generateQuestions(dto);
  }

  @Post('ai/format')
  format(@Body() dto: FormatTextDto) {
    return this.topics.formatRawText(dto);
  }
}
