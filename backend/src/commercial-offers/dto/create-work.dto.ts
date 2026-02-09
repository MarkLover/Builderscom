export class CreateWorkDto {
    name: string;
    quantity: number;
    unit: string; // "м2" | "шт" | "мп"
    price: number;
}
