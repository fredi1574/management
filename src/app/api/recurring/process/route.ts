import { NextResponse } from "next/server";
import { processAllRecurring } from "@/lib/recurring";
import { handleApiError } from "@/lib/error-handler";
import { withMiddleware } from "@/lib/api-middleware";

/**
 * POST /api/recurring/process - Process all pending recurring transactions
 * This endpoint should be called by a cron job (e.g., daily at midnight)
 */
async function handler(request: Request) {
  try {
    const result = await processAllRecurring();

    return NextResponse.json(
      {
        message: "Recurring transactions processed successfully",
        ...result,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to process recurring transactions");
  }
}

export const POST = withMiddleware(handler, {
  methods: ["POST"],
  rateLimit: true,
});
