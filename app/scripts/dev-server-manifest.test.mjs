import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createInactiveManifest,
  createRunningManifest,
  detectServerUrl,
  normalizeLocalServerUrl,
  writeManifestAtomic,
} from "./dev-server-manifest.mjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("dev server manifest helpers", () => {
  it("detects and normalizes local Vinxi URLs", () => {
    expect(detectServerUrl("  Local: http://0.0.0.0:3210/"))
      .toBe("http://localhost:3210");
    expect(normalizeLocalServerUrl("https://example.com:3000"))
      .toBeNull();
  });

  it("advertises active server details", () => {
    const manifest = createRunningManifest({
      app: "example-bare",
      status: "running",
      url: "http://localhost:3000",
      startedAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: "2026-01-01T00:00:01.000Z",
      repoRoot: "/repo",
      appRoot: "/repo/app",
      command: { executable: "vinxi", args: ["dev"] },
      processDetails: { wrapperPid: 1, serverPid: 2 },
      environment: {},
      recentOutput: [],
    });

    expect(manifest).toMatchObject({
      status: "running",
      serverLikelyRunning: true,
      url: "http://localhost:3000",
      port: "3000",
    });
  });

  it("clears advertised connection details after shutdown", () => {
    const manifest = createInactiveManifest({
      app: "example-bare",
      status: "likely-not-running",
      stoppedAt: new Date("2026-01-01T00:01:00.000Z"),
      updatedAt: "2026-01-01T00:01:00.000Z",
      repoRoot: "/repo",
      appRoot: "/repo/app",
      exitCode: 0,
      exitSignal: null,
    });

    expect(manifest).toMatchObject({
      status: "likely-not-running",
      serverLikelyRunning: false,
      url: null,
      port: null,
      exit: { code: 0, signal: null },
    });
  });

  it("keeps concurrent manifest writes valid", async () => {
    const directory = await mkdtemp(join(tmpdir(), "dev-server-manifest-"));
    temporaryDirectories.push(directory);
    const manifestPath = join(directory, "live-server-details.json");
    const payloads = Array.from({ length: 12 }, (_, index) => ({ index }));

    await Promise.all(payloads.map((payload) => writeManifestAtomic(manifestPath, payload)));

    const result = JSON.parse(await readFile(manifestPath, "utf8"));
    expect(payloads).toContainEqual(result);
  });
});
