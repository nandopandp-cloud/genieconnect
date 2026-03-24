export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(req: Request) {
  const reader = req.body?.getReader();
  let bytes = 0;
  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value?.byteLength ?? 0;
    }
  }
  return Response.json(
    { received: bytes },
    { headers: { "Cache-Control": "no-store" } }
  );
}
