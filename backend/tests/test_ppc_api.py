"""
PPC Campaign Analytics Backend API tests.
Covers /api/meta and /api/analytics with various filter combinations.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback: read frontend/.env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ── Meta tests ──────────────────────────────────────────────────────────────
class TestMeta:
    def test_meta_ok(self, client):
        r = client.get(f"{API}/meta", timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert len(d["platforms"]) == 5
        assert len(d["regions"]) == 5
        assert len(d["content_types"]) == 4
        assert len(d["genders"]) == 3
        assert d["ages"] == ["18-24", "25-34", "35-44", "45-54", "55+"]
        assert d["total_rows"] == 1000
        assert d["date_min"] == "2024-02-10"
        assert d["date_max"] == "2025-02-09"
        assert isinstance(d["median_roas"], (int, float))


# ── Analytics no-filter ────────────────────────────────────────────────────
class TestAnalyticsUnfiltered:
    @pytest.fixture(scope="class")
    def data(self, client):
        r = client.get(f"{API}/analytics", timeout=60)
        assert r.status_code == 200
        return r.json()

    def test_count(self, data):
        assert data["empty"] is False
        assert data["count"] == 1000

    def test_required_keys(self, data):
        required = [
            "kpis", "roas_by_platform", "roas_distribution", "platform_content_heatmap",
            "performance_split", "roas_by_region", "revenue_by_region", "roas_by_age",
            "region_age_heatmap", "region_platform_heatmap", "cpc_by_platform",
            "cpc_vs_roas", "spend_vs_revenue", "budget_allocation", "monthly_trends",
            "quarterly_platform", "content_type_stats", "top_campaigns",
            "bottom_campaigns", "correlation_matrix", "insights",
        ]
        missing = [k for k in required if k not in data]
        assert missing == [], f"Missing keys: {missing}"

    def test_kpis_numeric(self, data):
        k = data["kpis"]
        for key in ["avg_roas", "avg_cpc", "total_revenue", "total_spend", "median_roas"]:
            v = k[key]
            assert isinstance(v, (int, float)), f"{key} not numeric: {v}"
            assert v == v, f"{key} is NaN"
            assert v not in (None,)
        assert k["total_campaigns"] == 1000

    def test_top_bottom_10(self, data):
        assert len(data["top_campaigns"]) == 10
        assert len(data["bottom_campaigns"]) == 10
        # Top ROAS should be >= bottom ROAS
        assert data["top_campaigns"][0]["roas"] >= data["bottom_campaigns"][0]["roas"]

    def test_correlation_12x12(self, data):
        cm = data["correlation_matrix"]
        assert len(cm["cols"]) == 12
        assert len(cm["values"]) == 12
        for row in cm["values"]:
            assert len(row) == 12

    def test_insights_present(self, data):
        i = data["insights"]
        for key in ["best_platform", "best_region", "best_age", "best_content"]:
            assert i[key]["name"] is not None
            assert isinstance(i[key]["roas"], (int, float))


# ── Analytics with filters ─────────────────────────────────────────────────
class TestAnalyticsFilters:
    def test_platform_filter(self, client):
        r = client.get(f"{API}/analytics", params={"platforms": "Google"}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["empty"] is False
        assert d["count"] < 1000 and d["count"] > 0
        # roas_by_platform should only have Google
        platforms = [p["platform"] for p in d["roas_by_platform"]]
        assert platforms == ["Google"]
        # cpc_by_platform same
        assert all(p["platform"] == "Google" for p in d["cpc_by_platform"])

    def test_date_filter_narrows(self, client):
        r = client.get(
            f"{API}/analytics",
            params={"start_date": "2024-06-01", "end_date": "2024-06-30"},
            timeout=30,
        )
        assert r.status_code == 200
        d = r.json()
        assert d["empty"] is False
        assert d["count"] < 1000

    def test_nonmatching_filter_empty(self, client):
        # Invalid platform should yield empty
        r = client.get(f"{API}/analytics", params={"platforms": "NonExistentPlatform"}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d.get("empty") is True
        assert d.get("count") == 0

    def test_multi_filter(self, client):
        r = client.get(
            f"{API}/analytics",
            params={"platforms": ["Google", "Facebook"], "regions": "North America"},
            timeout=30,
        )
        assert r.status_code == 200
        d = r.json()
        # Either filtered-down or empty; must not error
        assert "count" in d
