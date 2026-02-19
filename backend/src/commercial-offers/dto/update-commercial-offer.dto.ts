export class UpdateCommercialOfferDto {
    address?: string;
    customerName?: string;
    customerPhone?: string;
    discount?: number;
    discountType?: string; // "percent" | "fixed"
}
