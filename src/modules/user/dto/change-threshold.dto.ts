import { ApiProperty } from '@nestjs/swagger';
import { KeystrokeModelEntity } from 'src/modules/keystroke/entities/keystrokeModel.entity';

export class KeystrokeModelDtoThreshold {
  @ApiProperty()
  id: number;

  @ApiProperty()
  modelName: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  acceptanceThreshold: number;

  @ApiProperty()
  samplesUsed: number;

  @ApiProperty()
  loss: number;

  @ApiProperty()
  trainedAt: Date;

  @ApiProperty()
  isActive: boolean;

  constructor(entity: KeystrokeModelEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.modelName = entity.modelName;
    this.acceptanceThreshold = entity.acceptanceThreshold;
    this.samplesUsed = entity.samplesUsed;
    this.loss = entity.loss;
    this.trainedAt = entity.trainedAt;
    this.isActive = entity.isActive;
  }
}
