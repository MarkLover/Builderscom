export class CreateCompanyExpenseDto {
    description: string;
    amount: number;
    category: string;
    date: string;
    receipt?: string;
}
