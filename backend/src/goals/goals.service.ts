import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  create(createGoalDto: CreateGoalDto) {
    return this.prisma.goal.create({ data: createGoalDto });
  }

  findDrafts() {
    return this.prisma.goal.findMany({ where: { published: false } });
  }

  findAll() {
    return this.prisma.goal.findMany({ where: { published: true } });
  }

  findOne(id: number) {
    return this.prisma.goal.findUnique({ where: { id } });
  }

  update(id: number, updateGoalDto: UpdateGoalDto) {
    return this.prisma.goal.update({
      where: { id },
      data: updateGoalDto,
    });
  }

  remove(id: number) {
    return this.prisma.goal.delete({ where: { id } });
  }
}
