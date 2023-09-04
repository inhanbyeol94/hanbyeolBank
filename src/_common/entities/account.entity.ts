import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './client.entity';
import { AccountType } from './accountType.entity';
import { Trade } from './trade.entity';
import { Partner } from './partner.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Client, (client) => client.accounts)
  client: Client;

  @ManyToOne(() => AccountType, (accountType) => accountType.accounts)
  accountType: AccountType;

  @OneToMany(() => Trade, (trade) => trade.account)
  trades: Trade[];

  @OneToOne(() => Partner)
  partner: Partner;
}
