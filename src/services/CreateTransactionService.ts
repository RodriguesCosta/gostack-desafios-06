import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('not have balance for create this outcome');
    }

    let categoryCreated = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryCreated) {
      categoryCreated = await categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryCreated);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryCreated,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
