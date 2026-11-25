import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'apps/playground/public/snapshots');

async function main() {
  await mkdir(outDir, { recursive: true });

  const yieldsRes = await fetch('https://yields.llama.fi/pools');
  const yieldsJson = await yieldsRes.json();
  const pools = yieldsJson.data
    .filter((p) => p.stablecoin && p.ilRisk === 'no' && p.tvlUsd > 5e6)
    .slice(0, 40);
  await writeFile(join(outDir, 'yields.json'), JSON.stringify({ data: pools }));

  const pendleRes = await fetch('https://api-v2.pendle.finance/core/v1/1/markets/active');
  const pendleJson = await pendleRes.json();
  pendleJson.markets = pendleJson.markets.slice(0, 30);
  await writeFile(join(outDir, 'pendle.json'), JSON.stringify(pendleJson));

  const meta = await fetch('https://api.hyperliquid.xyz/info', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
  }).then((r) => r.json());

  await writeFile(
    join(outDir, 'meta.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), meta }),
  );

  console.log('Snapshots written to', outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});