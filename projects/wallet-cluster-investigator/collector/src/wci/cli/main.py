from __future__ import annotations

import asyncio
import json
from pathlib import Path

import typer

from wci.cli.investigate import run_investigation
from wci.reporting.schema import export_json_schema

app = typer.Typer(
    name="wci",
    help="Wallet Cluster Investigator — expand funding graphs and cluster wallets.",
    no_args_is_help=True,
)


@app.command("investigate")
def investigate(
    address: str = typer.Argument(..., help="Seed EVM address (0x…)"),
    chain: str = typer.Option("ethereum", "--chain", "-c", help="Chain slug (ethereum, base, …)"),
    depth: int = typer.Option(2, "--depth", "-d", help="BFS depth limit"),
    max_nodes: int = typer.Option(300, "--max-nodes", help="Maximum unique nodes"),
    since: str | None = typer.Option(None, "--since", help="ISO date — ignore transfers before this"),
    min_value_eth: float = typer.Option(0.0, "--min-value-eth", help="Minimum native transfer value"),
    out: Path = typer.Option(..., "--out", "-o", help="Output investigation JSON path"),
    labels: Path | None = typer.Option(None, "--labels", help="Seed labels YAML"),
    cache_dir: Path | None = typer.Option(None, "--cache-dir", help="Blockscout response cache directory"),
) -> None:
    """Expand an address into a funding graph and write investigation JSON + Markdown."""

    asyncio.run(
        run_investigation(
            address,
            chain=chain,
            depth=depth,
            max_nodes=max_nodes,
            since=since,
            min_value_eth=min_value_eth,
            out=out,
            labels_path=labels,
            cache_dir=cache_dir,
        )
    )
    typer.echo(f"Wrote investigation to {out}")


@app.command("export-json-schema")
def export_schema(
    out: Path = typer.Option(Path("investigation.schema.json"), "--out", "-o"),
) -> None:
    """Export Pydantic investigation JSON Schema (v1)."""

    schema = export_json_schema()
    out.write_text(json.dumps(schema, indent=2), encoding="utf-8")
    typer.echo(f"Wrote schema to {out}")


if __name__ == "__main__":
    app()
