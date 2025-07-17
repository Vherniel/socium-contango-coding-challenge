'use server';

import { actionClient } from "@/lib/action-client";
import { returnValidationErrors } from "next-safe-action";
import { inputSchema } from "./_model.schema";

export const loginUser = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput: { username, password } }) => {
    if (username === "johndoe" && password === "123456") {
      return {
        success: "Successfully logged in",
      };
    }

    return returnValidationErrors(inputSchema, { _errors: ["Incorrect credentials"] });
  });
