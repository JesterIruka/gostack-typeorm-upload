// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_name: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_name,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      if (balance.total < value) {
        throw new AppError("You don't have enough balance");
      }
    }

    let category = await categoryRepository.findOne({
      where: { title: category_name },
    });

    if (!category) {
      category = categoryRepository.create({
        title: category_name,
      });
      await categoryRepository.save(category);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
