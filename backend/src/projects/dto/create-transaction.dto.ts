export class CreateTransactionDto {
    type: 'expense' | 'income';
    amount: number;
    category: string;
    description: string;
    date?: string; // ISO string
    stageId?: number; // Optional link to stage
    receipt?: string; // Optional link to receipt
}
