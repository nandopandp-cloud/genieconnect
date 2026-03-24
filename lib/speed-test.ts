const PING_ENDPOINT = "/api/speed/ping";
const PING_SAMPLES = 12;
const PING_WARMUP = 2;
const DL_WORKERS = 6;
const DL_DURATION_MS = 5_000;
const DL_CHUNK_BYTES = 10 * 1024 * 1024; // 10 MB
const UL_WORKERS = 4;
const UL_DURATION_MS = 10_000;
const UL_CHUNK_BYTES = 5 * 1024 * 1024; // 5 MB

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function average(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function round(n: number, decimals = 1) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

export async function measurePing(): Promise<{
  pingMs: number;
  jitterMs: number;
}> {
  const samples: number[] = [];

  for (let i = 0; i < PING_SAMPLES; i++) {
    const t0 = performance.now();
    await fetch(`${PING_ENDPOINT}?t=${Date.now()}`, {
      cache: "no-store",
      method: "GET",
    });
    samples.push(performance.now() - t0);
    await delay(50);
  }

  const active = samples.slice(PING_WARMUP);
  const pingMs = average(active);
  const diffs = active.slice(1).map((v, i) => Math.abs(v - active[i]));
  const jitterMs = average(diffs);

  return { pingMs: round(pingMs, 1), jitterMs: round(jitterMs, 1) };
}

export async function measureDownload(
  onProgress: (mbps: number) => void,
  signal?: AbortSignal
): Promise<number> {
  const start = performance.now();
  let totalBytes = 0;
  let active = true;

  const timer = setTimeout(() => {
    active = false;
  }, DL_DURATION_MS);

  async function worker() {
    while (active && !signal?.aborted) {
      try {
        const r = await fetch(
          `https://speed.cloudflare.com/__down?bytes=${DL_CHUNK_BYTES}`,
          { cache: "no-store", signal }
        );
        if (!active || signal?.aborted) break;
        const buf = await r.arrayBuffer();
        totalBytes += buf.byteLength;
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed > 0) {
          onProgress(round((totalBytes * 8) / (elapsed * 1_000_000), 2));
        }
      } catch {
        break;
      }
    }
  }

  await Promise.allSettled(Array.from({ length: DL_WORKERS }, worker));
  clearTimeout(timer);

  const elapsed = (performance.now() - start) / 1000;
  return elapsed > 0 ? round((totalBytes * 8) / (elapsed * 1_000_000), 2) : 0;
}

export async function measureUpload(
  onProgress: (mbps: number) => void,
  signal?: AbortSignal
): Promise<number> {
  const payload = new Uint8Array(UL_CHUNK_BYTES);
  crypto.getRandomValues(payload);

  const start = performance.now();
  let totalBytes = 0;
  let active = true;

  const timer = setTimeout(() => {
    active = false;
  }, UL_DURATION_MS);

  async function worker() {
    while (active && !signal?.aborted) {
      try {
        await fetch("/api/speed/upload", {
          method: "POST",
          body: payload,
          cache: "no-store",
          signal,
        });
        if (!active || signal?.aborted) break;
        totalBytes += UL_CHUNK_BYTES;
        const elapsed = (performance.now() - start) / 1000;
        if (elapsed > 0) {
          onProgress(round((totalBytes * 8) / (elapsed * 1_000_000), 2));
        }
      } catch {
        break;
      }
    }
  }

  await Promise.allSettled(Array.from({ length: UL_WORKERS }, worker));
  clearTimeout(timer);

  const elapsed = (performance.now() - start) / 1000;
  return elapsed > 0 ? round((totalBytes * 8) / (elapsed * 1_000_000), 2) : 0;
}
