import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATABASE_TIMEOUT_MS = 4000;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
};

type CheckStatus = "ok" | "error";

type HealthBody = {
  ok: boolean;
  status: "ok" | "degraded";
  checks: {
    app: CheckStatus;
    database: CheckStatus;
  };
  checkedAt: string;
};

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function probeDatabase(): Promise<CheckStatus> {
  try {
    const { prisma } = await import("@/lib/prisma");
    await withTimeout(prisma.$queryRaw`SELECT 1`, DATABASE_TIMEOUT_MS);
    return "ok";
  } catch {
    return "error";
  }
}

async function getHealth(): Promise<{ body: HealthBody; status: number }> {
  const database = await probeDatabase();
  const ok = database === "ok";
  return {
    status: ok ? 200 : 503,
    body: {
      ok,
      status: ok ? "ok" : "degraded",
      checks: {
        app: "ok",
        database,
      },
      checkedAt: new Date().toISOString(),
    },
  };
}

export async function GET() {
  const { body, status } = await getHealth();
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

export async function HEAD() {
  const { status } = await getHealth();
  return new NextResponse(null, { status, headers: noStoreHeaders });
}
