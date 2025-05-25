import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { KeystrokeEvent } from './keystrokeEvent.entity';
import { SecretWord } from 'src/user/entities/secret-word.entity';
@Entity()
export class KeystrokeAttempt {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => User, (user) => user.keystrokeAttempts)
  user: User; // relacja do User

  @Column({ name: 'user_id' })
  userId: number; // kolumna do przechowywania userId

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KeystrokeEvent, (ke) => ke.attempt, { cascade: true })
  keystrokes: KeystrokeEvent[];

  @ManyToOne(() => SecretWord, (secretWord) => secretWord.attempts, {
    onDelete: 'CASCADE',
  })
  secretWord: SecretWord;
}
