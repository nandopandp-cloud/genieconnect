export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Timestamp": Date.now().toString(),
    },
  });
}
