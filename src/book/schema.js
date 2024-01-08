import { z } from "zod";

const currentYear = new Date().getFullYear();

export const bookPublishInputSchema = z.object({
  title: z.string().min(1).max(100),
  isbn: z.string().max(14),
  // publisher: z.string().max(100), // access from JWT
  publicationYear: z.number().min(1900).max(currentYear),
  genre: z.string().max(100),
  price: z.number().min(0),
  // addedDate: z.date(), // calculate on server
  description: z.string().max(10000),
});
