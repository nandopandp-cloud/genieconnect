export const dynamic = "force-dynamic";
export const runtime = "edge";

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(req: Request) {
  const reader = req.body?.getReader();
  let bytes = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value?.byteLength ?? 0;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        break;
      }
    }
  }
  return Response.json(
    { received: bytes },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    }
  );
}
