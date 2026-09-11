import { z } from "zod";

import { PAYMENT_LIMITS } from "@/lib/payment/constants";

export const createPaymentTransactionSchema = z
  .object({
    bookingGroupRef: z.string().trim().regex(/^NF-\d{5}$/, "Invalid group reference"),
    amount: z.coerce.number().int().min(PAYMENT_LIMITS.amountMin).max(PAYMENT_LIMITS.amountMax),
    description: z.string().trim().max(PAYMENT_LIMITS.descriptionMaxLength).optional(),
    providerId: z.string().uuid().optional(),
  })
  .strict();

export const listPaymentTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(PAYMENT_LIMITS.transactionListPageMax).default(PAYMENT_LIMITS.pageDefault).optional(),
  perPage: z.coerce.number().int().min(1).max(PAYMENT_LIMITS.transactionListPerPageMax).default(PAYMENT_LIMITS.transactionListPerPageDefault).optional(),
  search: z.string().trim().max(PAYMENT_LIMITS.transactionSearchMaxLength).optional(),
  status: z.enum(["all", "pending", "requested", "verified", "failed", "refunded", "cancelled"]).default("all").optional(),
});

export const verifyPaymentSchema = z
  .object({
    Authority: z.string().trim().min(1),
    Status: z.string().trim().optional(),
  })
  .strict();

export type CreatePaymentTransactionInput = z.infer<typeof createPaymentTransactionSchema>;
export type ListPaymentTransactionsQuery = z.infer<typeof listPaymentTransactionsQuerySchema>;
