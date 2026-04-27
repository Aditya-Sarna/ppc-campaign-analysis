"""
PPC Campaign Performance Analytics — FastAPI Backend
Loads the campaign dataset once at startup and exposes filter-aware
analytics endpoints used by the editorial React dashboard.
"""
from fastapi import FastAPI, APIRouter, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
from typing import List, Optional
import os
import logging
import numpy as np
import pandas as pd

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Data loading & preprocessing
# ─────────────────────────────────────────────────────────────────────────────
DATA_PATH = ROOT_DIR / "data" / "ppc_campaign_performance_data.xlsx"
AGE_ORDER = ["18-24", "25-34", "35-44", "45-54", "55+"]


def load_dataset() -> pd.DataFrame:
    df = pd.read_excel(DATA_PATH)
    df["Date"] = pd.to_datetime(df["Date"])
    df["Month"] = df["Date"].dt.to_period("M").astype(str)
    df["Quarter"] = df["Date"].dt.quarter.map({1: "Q1", 2: "Q2", 3: "Q3", 4: "Q4"})
    df["Year"] = df["Date"].dt.year

    # Cap outliers at 1st-99th percentile
    for col in ["ROAS", "CPC", "Revenue"]:
        df[col] = df[col].clip(df[col].quantile(0.01), df[col].quantile(0.99))

    median_roas = df["ROAS"].median()
    df["Performance"] = df["ROAS"].apply(lambda x: "High" if x >= median_roas else "Low")
    return df


DF = load_dataset()
logger.info(f"Loaded {len(DF):,} campaigns from {DATA_PATH.name}")


def apply_filters(
    platforms: Optional[List[str]],
    regions: Optional[List[str]],
    ages: Optional[List[str]],
    content_types: Optional[List[str]],
    genders: Optional[List[str]],
    start_date: Optional[str],
    end_date: Optional[str],
) -> pd.DataFrame:
    mask = pd.Series(True, index=DF.index)
    if platforms:
        mask &= DF["Platform"].isin(platforms)
    if regions:
        mask &= DF["Region"].isin(regions)
    if ages:
        mask &= DF["Target_Age"].isin(ages)
    if content_types:
        mask &= DF["Content_Type"].isin(content_types)
    if genders:
        mask &= DF["Target_Gender"].isin(genders)
    if start_date:
        mask &= DF["Date"] >= pd.to_datetime(start_date)
    if end_date:
        mask &= DF["Date"] <= pd.to_datetime(end_date)
    return DF[mask].copy()


def safe_round(v, n=2):
    if v is None or (isinstance(v, float) and (np.isnan(v) or np.isinf(v))):
        return 0.0
    return round(float(v), n)


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI setup
# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="PPC Campaign Analytics API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "PPC Campaign Analytics API", "rows": len(DF)}


@api_router.get("/meta")
async def get_meta():
    """Filter options + dataset metadata."""
    return {
        "platforms": sorted(DF["Platform"].unique().tolist()),
        "regions": sorted(DF["Region"].unique().tolist()),
        "ages": [a for a in AGE_ORDER if a in DF["Target_Age"].unique()],
        "content_types": sorted(DF["Content_Type"].unique().tolist()),
        "genders": sorted(DF["Target_Gender"].unique().tolist()),
        "date_min": DF["Date"].min().date().isoformat(),
        "date_max": DF["Date"].max().date().isoformat(),
        "total_rows": int(len(DF)),
        "median_roas": safe_round(DF["ROAS"].median(), 2),
    }


@api_router.get("/analytics")
async def get_analytics(
    platforms: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    ages: Optional[List[str]] = Query(None),
    content_types: Optional[List[str]] = Query(None),
    genders: Optional[List[str]] = Query(None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    dff = apply_filters(platforms, regions, ages, content_types, genders, start_date, end_date)
    n = len(dff)

    if n == 0:
        return {"empty": True, "count": 0}

    # ── KPIs ────────────────────────────────────────────────────────────────
    kpis = {
        "total_campaigns": int(n),
        "avg_roas": safe_round(dff["ROAS"].mean(), 2),
        "avg_cpc": safe_round(dff["CPC"].mean(), 2),
        "avg_ctr": safe_round(dff["CTR"].mean(), 4),
        "avg_conversion_rate": safe_round(dff["Conversion_Rate"].mean(), 4),
        "total_revenue": safe_round(dff["Revenue"].sum(), 2),
        "total_spend": safe_round(dff["Spend"].sum(), 2),
        "total_impressions": int(dff["Impressions"].sum()),
        "total_clicks": int(dff["Clicks"].sum()),
        "total_conversions": int(dff["Conversions"].sum()),
        "median_roas": safe_round(dff["ROAS"].median(), 2),
    }

    # ── ROAS by Platform ────────────────────────────────────────────────────
    roas_by_platform = [
        {"platform": p, "roas": safe_round(v, 2)}
        for p, v in dff.groupby("Platform")["ROAS"].mean().sort_values(ascending=False).items()
    ]

    # ── ROAS distribution histogram (40 bins) ──────────────────────────────
    counts, edges = np.histogram(dff["ROAS"], bins=30)
    roas_distribution = [
        {
            "bin": safe_round((edges[i] + edges[i + 1]) / 2, 2),
            "range": f"{edges[i]:.2f}-{edges[i+1]:.2f}",
            "count": int(c),
        }
        for i, c in enumerate(counts)
    ]

    # ── Platform × Content heatmap ──────────────────────────────────────────
    pc = dff.pivot_table(values="ROAS", index="Content_Type", columns="Platform", aggfunc="mean")
    platform_content_heatmap = {
        "rows": pc.index.tolist(),
        "cols": pc.columns.tolist(),
        "values": [[safe_round(v, 2) for v in row] for row in pc.values],
    }

    # ── Performance split ──────────────────────────────────────────────────
    perf_counts = dff["Performance"].value_counts().to_dict()
    perf_stats = (
        dff.groupby("Performance")[["ROAS", "Spend", "Revenue", "Conversion_Rate"]]
        .mean()
        .round(2)
    )
    performance_split = {
        "counts": [
            {"name": "High", "value": int(perf_counts.get("High", 0))},
            {"name": "Low", "value": int(perf_counts.get("Low", 0))},
        ],
        "stats": [
            {
                "performance": idx,
                "roas": safe_round(perf_stats.loc[idx, "ROAS"], 2),
                "spend": safe_round(perf_stats.loc[idx, "Spend"], 2),
                "revenue": safe_round(perf_stats.loc[idx, "Revenue"], 2),
                "conversion_rate": safe_round(perf_stats.loc[idx, "Conversion_Rate"], 4),
            }
            for idx in perf_stats.index
        ],
    }

    # ── Region analytics ────────────────────────────────────────────────────
    roas_by_region = [
        {"region": r, "roas": safe_round(v, 2)}
        for r, v in dff.groupby("Region")["ROAS"].mean().sort_values(ascending=True).items()
    ]
    revenue_by_region = [
        {"region": r, "revenue": safe_round(v, 2)}
        for r, v in dff.groupby("Region")["Revenue"].sum().sort_values(ascending=True).items()
    ]
    spend_by_region = [
        {"region": r, "spend": safe_round(v, 2)}
        for r, v in dff.groupby("Region")["Spend"].sum().sort_values(ascending=True).items()
    ]

    # ── Age analytics ──────────────────────────────────────────────────────
    age_groups = dff.groupby("Target_Age").agg(
        roas=("ROAS", "mean"), revenue=("Revenue", "sum"), count=("Campaign_ID", "count")
    )
    roas_by_age = []
    for a in AGE_ORDER:
        if a in age_groups.index:
            roas_by_age.append(
                {
                    "age": a,
                    "roas": safe_round(age_groups.loc[a, "roas"], 2),
                    "revenue": safe_round(age_groups.loc[a, "revenue"], 2),
                    "count": int(age_groups.loc[a, "count"]),
                }
            )

    # ── Region × Age heatmap ───────────────────────────────────────────────
    ra = dff.pivot_table(values="ROAS", index="Region", columns="Target_Age", aggfunc="mean")
    age_cols = [c for c in AGE_ORDER if c in ra.columns]
    ra = ra[age_cols]
    region_age_heatmap = {
        "rows": ra.index.tolist(),
        "cols": ra.columns.tolist(),
        "values": [[safe_round(v, 2) for v in row] for row in ra.values],
    }

    # ── Region × Platform heatmap ──────────────────────────────────────────
    rp = dff.pivot_table(values="ROAS", index="Region", columns="Platform", aggfunc="mean")
    region_platform_heatmap = {
        "rows": rp.index.tolist(),
        "cols": rp.columns.tolist(),
        "values": [[safe_round(v, 2) for v in row] for row in rp.values],
    }

    # ── CPC analytics ──────────────────────────────────────────────────────
    cpc_by_platform = [
        {"platform": p, "cpc": safe_round(v, 2)}
        for p, v in dff.groupby("Platform")["CPC"].mean().sort_values().items()
    ]

    # ── CPC vs ROAS scatter (sample if large) ──────────────────────────────
    sample = dff.sample(min(400, n), random_state=42) if n > 400 else dff
    cpc_vs_roas = [
        {
            "cpc": safe_round(r["CPC"], 2),
            "roas": safe_round(r["ROAS"], 2),
            "revenue": safe_round(r["Revenue"], 2),
            "platform": r["Platform"],
        }
        for _, r in sample.iterrows()
    ]
    spend_vs_revenue = [
        {
            "spend": safe_round(r["Spend"], 2),
            "revenue": safe_round(r["Revenue"], 2),
            "platform": r["Platform"],
        }
        for _, r in sample.iterrows()
    ]

    # ── Budget allocation recommendation ───────────────────────────────────
    plat_roas_all = dff.groupby("Platform")["ROAS"].mean()
    if plat_roas_all.sum() > 0:
        alloc = (plat_roas_all / plat_roas_all.sum() * 100).round(1)
        budget_allocation = [
            {"platform": p, "percent": safe_round(v, 1), "current_spend": safe_round(dff[dff["Platform"] == p]["Spend"].sum(), 0)}
            for p, v in alloc.sort_values(ascending=False).items()
        ]
    else:
        budget_allocation = []

    # ── Monthly trends ─────────────────────────────────────────────────────
    monthly = (
        dff.groupby("Month")
        .agg(
            avg_roas=("ROAS", "mean"),
            total_revenue=("Revenue", "sum"),
            total_spend=("Spend", "sum"),
            campaigns=("Campaign_ID", "count"),
        )
        .reset_index()
        .sort_values("Month")
    )
    monthly_trends = [
        {
            "month": r["Month"],
            "avg_roas": safe_round(r["avg_roas"], 2),
            "revenue": safe_round(r["total_revenue"], 2),
            "spend": safe_round(r["total_spend"], 2),
            "campaigns": int(r["campaigns"]),
        }
        for _, r in monthly.iterrows()
    ]

    # ── Quarterly platform performance ─────────────────────────────────────
    qp = dff.groupby(["Quarter", "Platform"])["ROAS"].mean().reset_index()
    quarters = sorted(qp["Quarter"].unique().tolist())
    platforms_present = sorted(qp["Platform"].unique().tolist())
    quarterly_platform = []
    for q in quarters:
        row = {"quarter": q}
        for p in platforms_present:
            sub = qp[(qp["Quarter"] == q) & (qp["Platform"] == p)]
            row[p] = safe_round(sub["ROAS"].iloc[0], 2) if not sub.empty else 0
        quarterly_platform.append(row)

    # ── Content type analytics ─────────────────────────────────────────────
    content_stats = (
        dff.groupby("Content_Type")
        .agg(roas=("ROAS", "mean"), revenue=("Revenue", "sum"), count=("Campaign_ID", "count"))
        .reset_index()
    )
    content_type_stats = [
        {
            "content_type": r["Content_Type"],
            "roas": safe_round(r["roas"], 2),
            "revenue": safe_round(r["revenue"], 2),
            "count": int(r["count"]),
        }
        for _, r in content_stats.iterrows()
    ]

    # ── Top 10 / Bottom 10 ─────────────────────────────────────────────────
    top10 = dff.nlargest(10, "ROAS")
    bot10 = dff.nsmallest(10, "ROAS")

    def serialize_campaign(r):
        return {
            "campaign_id": r["Campaign_ID"],
            "platform": r["Platform"],
            "region": r["Region"],
            "target_age": r["Target_Age"],
            "content_type": r["Content_Type"],
            "roas": safe_round(r["ROAS"], 2),
            "spend": safe_round(r["Spend"], 0),
            "revenue": safe_round(r["Revenue"], 0),
            "date": r["Date"].date().isoformat() if isinstance(r["Date"], pd.Timestamp) else str(r["Date"]),
        }

    top_campaigns = [serialize_campaign(r) for _, r in top10.iterrows()]
    bottom_campaigns = [serialize_campaign(r) for _, r in bot10.iterrows()]

    # ── Correlation matrix ─────────────────────────────────────────────────
    corr_cols = [
        "Budget", "Clicks", "CTR", "CPC", "Conversions", "CPA",
        "Conversion_Rate", "Duration", "Revenue", "Spend", "ROAS", "Impressions",
    ]
    corr = dff[corr_cols].corr().round(2)
    correlation_matrix = {
        "cols": corr.columns.tolist(),
        "values": [[safe_round(v, 2) for v in row] for row in corr.values],
    }

    # ── Insights / business callouts ───────────────────────────────────────
    plat_roas = dff.groupby("Platform")["ROAS"].mean()
    reg_roas = dff.groupby("Region")["ROAS"].mean()
    age_roas_series = dff.groupby("Target_Age")["ROAS"].mean()
    content_roas = dff.groupby("Content_Type")["ROAS"].mean()

    high_df = dff[dff["Performance"] == "High"]
    low_df = dff[dff["Performance"] == "Low"]

    insights = {
        "best_platform": {
            "name": plat_roas.idxmax() if not plat_roas.empty else None,
            "roas": safe_round(plat_roas.max(), 2) if not plat_roas.empty else 0,
        },
        "worst_platform": {
            "name": plat_roas.idxmin() if not plat_roas.empty else None,
            "roas": safe_round(plat_roas.min(), 2) if not plat_roas.empty else 0,
        },
        "best_region": {
            "name": reg_roas.idxmax() if not reg_roas.empty else None,
            "roas": safe_round(reg_roas.max(), 2) if not reg_roas.empty else 0,
        },
        "best_age": {
            "name": age_roas_series.idxmax() if not age_roas_series.empty else None,
            "roas": safe_round(age_roas_series.max(), 2) if not age_roas_series.empty else 0,
        },
        "best_content": {
            "name": content_roas.idxmax() if not content_roas.empty else None,
            "roas": safe_round(content_roas.max(), 2) if not content_roas.empty else 0,
        },
        "high_avg_spend": safe_round(high_df["Spend"].mean(), 0) if len(high_df) else 0,
        "low_avg_spend": safe_round(low_df["Spend"].mean(), 0) if len(low_df) else 0,
        "high_conv_rate": safe_round(high_df["Conversion_Rate"].mean(), 4) if len(high_df) else 0,
        "low_conv_rate": safe_round(low_df["Conversion_Rate"].mean(), 4) if len(low_df) else 0,
        "wasted_spend_bottom_10pct": safe_round(
            dff.nsmallest(max(1, int(n * 0.1)), "ROAS")["Spend"].sum(), 0
        ),
        "scale_spend_top_10pct": safe_round(
            dff.nlargest(max(1, int(n * 0.1)), "ROAS")["Spend"].sum(), 0
        ),
    }

    return {
        "empty": False,
        "count": n,
        "kpis": kpis,
        "roas_by_platform": roas_by_platform,
        "roas_distribution": roas_distribution,
        "platform_content_heatmap": platform_content_heatmap,
        "performance_split": performance_split,
        "roas_by_region": roas_by_region,
        "revenue_by_region": revenue_by_region,
        "spend_by_region": spend_by_region,
        "roas_by_age": roas_by_age,
        "region_age_heatmap": region_age_heatmap,
        "region_platform_heatmap": region_platform_heatmap,
        "cpc_by_platform": cpc_by_platform,
        "cpc_vs_roas": cpc_vs_roas,
        "spend_vs_revenue": spend_vs_revenue,
        "budget_allocation": budget_allocation,
        "monthly_trends": monthly_trends,
        "quarterly_platform": quarterly_platform,
        "quarterly_platform_keys": platforms_present,
        "content_type_stats": content_type_stats,
        "top_campaigns": top_campaigns,
        "bottom_campaigns": bottom_campaigns,
        "correlation_matrix": correlation_matrix,
        "insights": insights,
    }


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
