from wci.reporting.schema import Investigation, export_json_schema


def test_json_schema_has_version_and_clusters() -> None:
    schema = export_json_schema()
    assert schema.get("title") == "Investigation"
    props = schema.get("properties", {})
    assert "clusters" in props
    assert "metadata" in props


def test_investigation_round_trip() -> None:
    raw = Investigation.model_validate_json(
        """{
          "metadata": {
            "schema_version": "1.0.0",
            "chain": "ethereum",
            "seed_address": "0xabc",
            "data_source": "blockscout",
            "generated_at": "2024-01-01T00:00:00Z"
          },
          "nodes": [],
          "edges": [],
          "clusters": []
        }"""
    )
    assert raw.metadata.chain == "ethereum"