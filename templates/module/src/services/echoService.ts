import { z } from "zod";

export const echoService = {
  key: "__MODULE_ID__.echo",
  description: "Trivial echo service for contract proof",
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ message: z.string() }),
  handler: (input: { message: string }) => input
};
