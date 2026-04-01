import { z } from "zod";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  DELIVERY_TYPES,
} from "@/types/app";

export const orderStatusSchema = z.enum(ORDER_STATUSES);
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);
export const deliveryTypeSchema = z.enum(DELIVERY_TYPES);

export const checkoutSchema = z
  .object({
    customer_name: z.string().min(2, "Name is not valid"),
    customer_phone: z
      .string()
      .regex(/^(0|\+84)[3-9]\d{8}$/, "Phone is not valid"),
    customer_email: z
      .string()
      .email("Email is not valid")
      .optional()
      .or(z.literal("")),
    is_self_receiver: z.boolean(),
    receiver_name: z.string().min(2, "Name is not valid").optional(),
    receiver_phone: z
      .string()
      .regex(/^(0|\+84)[3-9]\d{8}$/, "Phone is not valid")
      .optional(),
    address: z.string().min(10, "Address is not valid"),
    note: z.string().max(500).optional(),
    delivery_type: deliveryTypeSchema,
    delivery_time: z.string().datetime().optional(),
    payment_method: paymentMethodSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.is_self_receiver) {
      if (!data.receiver_name || data.receiver_name.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Name is not valid",
          path: ["receiver_name"],
        });
      }
      if (!data.receiver_phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Phone is not valid",
          path: ["receiver_phone"],
        });
      }
    }
    if (data.delivery_type === "SCHEDULED" && !data.delivery_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Time is not valid",
        path: ["delivery_time"],
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: orderStatusSchema,
});

export const updatePaymentStatusSchema = z.object({
  orderId: z.string().uuid(),
  payment_status: paymentStatusSchema,
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdatePaymentStatusInput = z.infer<
  typeof updatePaymentStatusSchema
>;
