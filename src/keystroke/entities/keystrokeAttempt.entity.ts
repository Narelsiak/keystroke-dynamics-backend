import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { KeystrokeEvent } from './keystrokeEvent.entity';
import { SecretWord } from 'src/user/entities/secret-word.entity';
@Entity()
export class KeystrokeAttempt {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number; // kolumna do przechowywania userId

  @Column({ name: 'secret_word_id' })
  secretWordId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => KeystrokeEvent, (ke) => ke.attempt, { cascade: true })
  keystrokes: KeystrokeEvent[];

  @ManyToOne(() => SecretWord, (secretWord) => secretWord.attempts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'secret_word_id' })
  secretWord: SecretWord;

  @ManyToOne(() => User, (user) => user.keystrokeAttempts)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
