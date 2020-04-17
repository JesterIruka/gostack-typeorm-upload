import { Router } from 'express';

import multer from 'multer';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const repository = getCustomRepository(TransactionsRepository);

  const transactions = await repository.find();
  const balance = await repository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const service = new CreateTransactionService();

  const transaction = await service.execute({
    title,
    value,
    type,
    category_name: category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const service = new DeleteTransactionService();
  await service.execute(id);

  return response.json(204);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const service = new ImportTransactionsService();

    const transactions = await service.execute(request.file);

    return response.json(transactions);
  },
);

export default transactionsRouter;
