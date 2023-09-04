import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Account } from './account.entity';

@Entity()
export class Partner {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  key: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => Account, {
    nullable: false,
  })
  @JoinColumn()
  account: Account;
}
