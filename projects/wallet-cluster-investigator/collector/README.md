# Wallet Cluster Investigator (collector)

Python CLI for expanding EVM addresses into funding graphs and clustering wallets with explainable heuristics.

```bash
pip install -e ".[dev]"
wci investigate 0xabc... --chain ethereum --depth 2 --max-nodes 300 --since 2024-01-01 --out out.json
wci export-json-schema --out investigation.schema.json
```