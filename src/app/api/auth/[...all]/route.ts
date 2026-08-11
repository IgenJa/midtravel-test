import { auth } from "@/lib/auth";
import { RATE_LIMITS, rateLimitRequest } from "@/lib/rate-limit";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export const GET = handlers.GET;

export async function POST(request: Request) {
  const limited = rateLimitRequest(request, "auth", RATE_LIMITS.auth);
  if (!limited.ok) {
    return Response.json(
      { message: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limited.retryAfterSec),
        },
      }
    );
  }

  return handlers.POST(request);
}
