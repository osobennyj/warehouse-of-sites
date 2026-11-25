from wci.clustering.union_find import UnionFind


def test_union_find_merges_transitively() -> None:
    uf = UnionFind()
    uf.union("a", "b")
    uf.union("b", "c")
    assert uf.find("a") == uf.find("c")


def test_union_find_components() -> None:
    uf = UnionFind()
    uf.union("w1", "w2")
    uf.union("w3", "w4")
    groups = uf.components()
    assert len(groups) == 2
    sizes = sorted(len(v) for v in groups.values())
    assert sizes == [2, 2]