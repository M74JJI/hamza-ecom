export type OrderEmailItem = {
  title: string;
  variant?: string | null;
  size?: string | null;
  quantity: number;
  unitPriceMAD: number;
};

export type OrderEmailData = {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  city: string;
  address: string;
  shippingCompany: string;
  subtotalMAD: number;
  discountMAD: number;
  shippingFeeMAD: number;
  totalMAD: number;
  items: OrderEmailItem[];
};
