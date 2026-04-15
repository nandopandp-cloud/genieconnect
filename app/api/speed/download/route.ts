export const dynamic = "force-dynamic";
export const runtime = "edge";

const MAX_BYTES = 50 * 1024 * 1024;
const DEFAULT_BYTES = 10 * 1024 * 1024;
const CHUNK_BYTES = 64 * 1024;

const filler = new Uint8Array(CHUNK_BYTES);
crypto.getRandomValues(filler);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const requested = Number(url.searchParams.get("bytes") ?? DEFAULT_BYTES);
  const total = Math.max(
    1,
    Math.min(MAX_BYTES, Number.isFinite(requested) ? requested : DEFAULT_BYTES)
  );

  let sent = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= total) {
        controller.close();
        return;
      }
      const remaining = total - sent;
      const size = Math.min(CHUNK_BYTES, remaining);
      const chunk = size === CHUNK_BYTES ? filler : filler.subarray(0, size);
      controller.enqueue(chunk);
      sent += size;
    },
    cancel() {
      sent = total;
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(total),
      "Content-Encoding": "identity",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
