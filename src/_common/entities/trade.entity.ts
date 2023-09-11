import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from './account.entity';
import { Log } from './log.entity';

@Entity()
export class Trade {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  status: number;

  @Column()
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Account, (account) => account.trades)
  account: Account;

  @OneToMany(() => Log, (log) => log.trade)
  logs: Log[];
}
