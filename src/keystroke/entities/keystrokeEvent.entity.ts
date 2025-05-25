import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { KeystrokeAttempt } from './keystrokeAttempt.entity';

@Entity()
export class KeystrokeEvent {
  @PrimaryGeneratedColumn()
  id: number;

  // znak, czyli wartość klawisza
  @Column()
  character: string;

  // kiedy wciśnięto (timestamp jako liczba milisekund)
  @Column('bigint')
  pressedAt: number;

  // kiedy puszczono (timestamp jako liczba milisekund)
  @Column('bigint')
  releasedAt: number;

  // ile trwało wciśnięcie w ms
  @Column()
  pressDuration: number;

  // czas od poprzedniego zwolnienia klawisza do wciśnięcia tego w ms
  @Column()
  waitDuration: number;

  // modyfikatory (shift, ctrl, alt, meta) - możemy zapisać jako JSON
  @Column('simple-json')
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => KeystrokeAttempt, (attempt) => attempt.keystrokes, {
    onDelete: 'CASCADE',
  })
  attempt: KeystrokeAttempt; // relacja do KeystrokeAttempt
}
