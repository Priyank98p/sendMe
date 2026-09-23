import { z } from "zod";

export const verifySchema = z.object({
  content: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(300,{message:"Message must not be more than 300 characters"})
});
