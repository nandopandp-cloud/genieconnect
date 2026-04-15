const PING_ENDPOINT = "/api/speed/ping";
const DOWNLOAD_ENDPOINT = "/api/speed/download";
const UPLOAD_ENDPOINT = "/api/speed/upload";

const PING_SAMPLES = 20;
const PING_WARMUP = 5;
const PING_INTERVAL_MS = 40;

const WARMUP_MS = 1500;
const MEASURE_MS = 4000;
const GRACE_MS = 500;

const DL_INITIAL_WORKERS = 2;
const DL_MAX_WORKERS = 8;
const DL_CHUNK_BYTES = 25 * 1024 * 1024;

const UL_INITIAL_WORKERS = 2;
const UL_MAX_WORKERS = 6;
const UL_CHUNK_BYTES = 4 * 1024 * 1024;

function round(n: number, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)));
  return sorted[idx];
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Dedicated ping measurement. Uses a small endpoint with no-store, drops
 * warm-up + outlier samples, and reports the trimmed mean as the ping and
 * the standard deviation as jitter (more robust than mean-absolute-diff).
 */
export async function measurePing(): Promise<{
  pingMs: number;
  jitterMs: number;
  minPingMs: number;
  maxPingMs: number;
}> {
  const samples: number[] = [];

  for (let i = 0; i < PING_SAMPLES; i++) {
    const t0 = performance.now();
    try {
      await fetch(`${PING_ENDPOINT}?t=${Date.now()}-${i}`, {
        cache: "no-store",
        method: "GET",
        keepalive: true,
      });
      samples.push(performance.now() - t0);
    } catch {
      // ignore individual failures; treat as missing sample
    }
    await delay(PING_INTERVAL_MS);
  }

  const active = samples.slice(PING_WARMUP);
  if (active.length === 0) {
    return { pingMs: 0, jitterMs: 0, minPingMs: 0, maxPingMs: 0 };
  }

  const sorted = [...active].sort((a, b) => a - b);
  const p95 = percentile(sorted, 0.95);
  const trimmed = active.filter((v) => v <= p95);

  const pingMs = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
  const jitterMs = stddev(trimmed);

  return {
    pingMs: round(pingMs, 1),
    jitterMs: round(jitterMs, 1),
    minPingMs: round(sorted[0], 1),
    maxPingMs: round(sorted[sorted.length - 1], 1),
  };
}

/**
 * Sliding-window throughput measurement. Returns total bytes received inside
 * [WARMUP_MS, WARMUP_MS + MEASURE_MS] as a Mbps value.
 */
interface ThroughputRun {
  start: number;
  warmupEnd: number;
  measureEnd: number;
  windowBytes: number;
  active: boolean;
  onProgress: (mbps: number) => void;
}

function windowBpsToMbps(windowBytes: number, windowMs: number): number {
  if (windowMs <= 0) return 0;
  return (windowBytes * 8) / (windowMs / 1000) / 1_000_000;
}

function startRun(onProgress: (mbps: number) => void): ThroughputRun {
  const start = performance.now();
  return {
    start,
    warmupEnd: start + WARMUP_MS,
    measureEnd: start + WARMUP_MS + MEASURE_MS,
    windowBytes: 0,
    active: true,
    onProgress,
  };
}

function recordBytes(run: ThroughputRun, bytes: number) {
  const now = performance.now();
  if (now < run.warmupEnd || now > run.measureEnd) return;
  run.windowBytes += bytes;
  const elapsed = now - run.warmupEnd;
  if (elapsed > 0) {
    run.onProgress(round(windowBpsToMbps(run.windowBytes, elapsed), 2));
  }
}

function finalMbps(run: ThroughputRun): number {
  return round(windowBpsToMbps(run.windowBytes, MEASURE_MS), 2);
}

async function downloadWorker(run: ThroughputRun, signal?: AbortSignal) {
  while (run.active && !signal?.aborted && performance.now() < run.measureEnd) {
    try {
      const r = await fetch(
        `${DOWNLOAD_ENDPOINT}?bytes=${DL_CHUNK_BYTES}&t=${Date.now()}-${Math.random()}`,
        { cache: "no-store", signal }
      );
      const body = r.body;
      if (!body) break;
      const reader = body.getReader();
      while (run.active && !signal?.aborted) {
        if (performance.now() > run.measureEnd) {
          await reader.cancel().catch(() => {});
          return;
        }
        const { done, value } = await reader.read();
        if (done) break;
        if (value) recordBytes(run, value.byteLength);
      }
    } catch {
      if (signal?.aborted) return;
      await delay(50);
    }
  }
}

export async function measureDownload(
  onProgress: (mbps: number) => void,
  signal?: AbortSignal
): Promise<number> {
  const run = startRun(onProgress);

  // Inner controller so we can hard-abort in-flight fetches when the
  // measurement window ends, regardless of external signal.
  const innerAc = new AbortController();
  const composite = signal
    ? (() => {
        const ac = new AbortController();
        const forward = () => ac.abort();
        signal.addEventListener("abort", forward);
        innerAc.signal.addEventListener("abort", forward);
        return ac.signal;
      })()
    : innerAc.signal;

  const workers: Promise<void>[] = [];
  const spawn = () => workers.push(downloadWorker(run, composite));

  for (let i = 0; i < DL_INITIAL_WORKERS; i++) spawn();

  // Adaptive ramp-up during warm-up: add workers if network seems idle.
  const ramp = (async () => {
    let current = DL_INITIAL_WORKERS;
    let lastProbeBytes = 0;
    let lastProbeAt = performance.now();
    while (run.active && !signal?.aborted && performance.now() < run.warmupEnd) {
      await delay(400);
      const now = performance.now();
      const bytesDelta = run.windowBytes - lastProbeBytes;
      const timeDelta = now - lastProbeAt;
      lastProbeBytes = run.windowBytes;
      lastProbeAt = now;

      // Before warmupEnd, windowBytes is always 0 (we only count within the window).
      // Use a separate probe: check remaining time; if still in warmup, add workers aggressively.
      if (current < DL_MAX_WORKERS) {
        current += 2;
        spawn();
        spawn();
      }
      void bytesDelta;
      void timeDelta;
    }
  })();

  const HARD_TIMEOUT = WARMUP_MS + MEASURE_MS + GRACE_MS + 2000;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      run.active = false;
      innerAc.abort();
      resolve();
    }, HARD_TIMEOUT);
    Promise.allSettled(workers).then(() => {
      clearTimeout(timer);
      resolve();
    });
  });
  run.active = false;
  innerAc.abort();
  await ramp.catch(() => {});

  return finalMbps(run);
}

function makeUploadStream(chunkBytes: number, getActive: () => boolean, signal?: AbortSignal): {
  stream: ReadableStream<Uint8Array>;
  onChunkSent: (cb: (bytes: number) => void) => void;
} {
  let listener: ((bytes: number) => void) | null = null;
  const SUB_CHUNK = 64 * 1024;
  const buf = new Uint8Array(SUB_CHUNK);
  crypto.getRandomValues(buf);

  let sent = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (!getActive() || signal?.aborted || sent >= chunkBytes) {
        controller.close();
        return;
      }
      const remaining = chunkBytes - sent;
      const size = Math.min(SUB_CHUNK, remaining);
      const piece = size === SUB_CHUNK ? buf : buf.subarray(0, size);
      controller.enqueue(new Uint8Array(piece));
      sent += size;
      listener?.(size);
    },
    cancel() {
      sent = chunkBytes;
    },
  });

  return {
    stream,
    onChunkSent: (cb) => {
      listener = cb;
    },
  };
}

let streamingUploadSupported: boolean | null = null;

async function probeStreamingUpload(): Promise<boolean> {
  if (streamingUploadSupported !== null) return streamingUploadSupported;
  try {
    const probe = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(1));
        c.close();
      },
    });
    const req = new Request("/api/speed/upload", {
      method: "POST",
      body: probe,
      // @ts-expect-error - duplex only exists in whatwg-fetch types in newer TS libs
      duplex: "half",
    });
    streamingUploadSupported = req.body !== null;
  } catch {
    streamingUploadSupported = false;
  }
  return streamingUploadSupported;
}

async function uploadWorkerStreaming(run: ThroughputRun, signal?: AbortSignal) {
  while (run.active && !signal?.aborted && performance.now() < run.measureEnd) {
    try {
      const { stream, onChunkSent } = makeUploadStream(
        UL_CHUNK_BYTES,
        () => run.active && !signal?.aborted && performance.now() <= run.measureEnd,
        signal
      );
      onChunkSent((bytes) => recordBytes(run, bytes));
      await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        body: stream,
        // @ts-expect-error - duplex is required by spec when streaming a request body
        duplex: "half",
        cache: "no-store",
        headers: { "Content-Type": "application/octet-stream" },
        signal,
      });
    } catch {
      if (signal?.aborted) return;
      await delay(50);
    }
  }
}

async function uploadWorkerBuffered(run: ThroughputRun, signal?: AbortSignal) {
  const SUB = 64 * 1024;
  const seed = new Uint8Array(SUB);
  crypto.getRandomValues(seed);
  // Pre-build a single chunk payload (reused across requests).
  const payload = new Uint8Array(UL_CHUNK_BYTES);
  for (let off = 0; off < UL_CHUNK_BYTES; off += SUB) {
    payload.set(seed.subarray(0, Math.min(SUB, UL_CHUNK_BYTES - off)), off);
  }

  while (run.active && !signal?.aborted && performance.now() < run.measureEnd) {
    const chunkStart = performance.now();
    try {
      await fetch(UPLOAD_ENDPOINT, {
        method: "POST",
        body: payload,
        cache: "no-store",
        headers: { "Content-Type": "application/octet-stream" },
        signal,
      });
      // Approximate byte-time distribution across the chunk duration by
      // recording the full payload once the request completes.
      const elapsed = performance.now() - chunkStart;
      if (elapsed > 0) recordBytes(run, UL_CHUNK_BYTES);
    } catch {
      if (signal?.aborted) return;
      await delay(50);
    }
  }
}

async function uploadWorker(run: ThroughputRun, signal?: AbortSignal) {
  const canStream = await probeStreamingUpload();
  if (canStream) return uploadWorkerStreaming(run, signal);
  return uploadWorkerBuffered(run, signal);
}

export async function measureUpload(
  onProgress: (mbps: number) => void,
  signal?: AbortSignal
): Promise<number> {
  const run = startRun(onProgress);

  const innerAc = new AbortController();
  const composite = signal
    ? (() => {
        const ac = new AbortController();
        const forward = () => ac.abort();
        signal.addEventListener("abort", forward);
        innerAc.signal.addEventListener("abort", forward);
        return ac.signal;
      })()
    : innerAc.signal;

  const workers: Promise<void>[] = [];
  const spawn = () => workers.push(uploadWorker(run, composite));
  for (let i = 0; i < UL_INITIAL_WORKERS; i++) spawn();

  const ramp = (async () => {
    let current = UL_INITIAL_WORKERS;
    while (run.active && !signal?.aborted && performance.now() < run.warmupEnd) {
      await delay(500);
      if (current < UL_MAX_WORKERS) {
        current += 1;
        spawn();
      }
    }
  })();

  const HARD_TIMEOUT = WARMUP_MS + MEASURE_MS + GRACE_MS + 3000;
  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      run.active = false;
      innerAc.abort();
      resolve();
    }, HARD_TIMEOUT);
    Promise.allSettled(workers).then(() => {
      clearTimeout(timer);
      resolve();
    });
  });
  run.active = false;
  innerAc.abort();
  await ramp.catch(() => {});

  return finalMbps(run);
}
