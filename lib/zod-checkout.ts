import { z } from 'zod';
import { MA_CITIES } from './ma-cities';
import { isValidMoroccanPhone } from './ma-phone';

export const AddressUpsertSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().refine(isValidMoroccanPhone, 'Invalid Moroccan phone'),
  city: z.enum(MA_CITIES as [string, ...string[]]),
  street: z.string().min(6, 'Address is too short'),
  isDefault: z.boolean().optional().default(false),
});

export const ApplyCouponSchema = z.object({
  code: z.string().trim().toUpperCase().min(2),
});

export const CheckoutSchema = z.object({
  addressId: z.string(),
  shippingCompanyId: z.string(),
  couponCode: z.string().optional().nullable(),
});
