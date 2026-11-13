// TEMPORARY diagnostics — remove with components/perf-probe.tsx.
// Prints the slow-frame report from the browser into the server log.
export async function POST(request: Request) {
  const report = await request.json().catch(() => null)
  console.log(`[perf-probe] ${JSON.stringify(report)}`)
  return new Response(null, { status: 204 })
}
