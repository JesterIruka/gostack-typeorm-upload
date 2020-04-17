/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';
import { getRepository } from 'typeorm';

import path from 'path';
import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CSVLine {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category_name: string;
}

class ImportTransactionsService {
  async execute(file: Express.Multer.File): Promise<Transaction[]> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const transactions: Transaction[] = [];

    const filePath = path.resolve(uploadConfig.directory, file.filename);
    const contents = await fs.promises.readFile(filePath);

    const parsed = contents
      .toString()
      .split('\n')
      .splice(1)
      .map(s => s.split(',').map(string => string.trim()))
      .filter(s => s.length === 4);

    for (const [title, type, value, category_name] of parsed) {
      if (type !== 'income' && type !== 'outcome') continue;

      let category = await categoryRepository.findOne({
        where: { title: category_name },
      });
      if (!category) {
        category = categoryRepository.create({ title: category_name });
        category = await categoryRepository.save(category);
      }
      transactions.push(
        transactionRepository.create({
          title,
          type,
          value: Number(value),
          category_id: category.id,
        }),
      );
    }

    await fs.promises.unlink(filePath);

    return transactionRepository.save(transactions);
  }
}

export default ImportTransactionsService;
