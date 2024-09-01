export interface NewProduct {
    name: string;
    description: string;
    price: number;
}


export type UpdateProduct = Partial<NewProduct>;