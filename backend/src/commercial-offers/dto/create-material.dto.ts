export class CreateMaterialDto {
    name: string;
    quantity: number;
    unit: string; // "шт" | "упаковок" | "кг" | "мп" | "м2"
    price: number;
}
