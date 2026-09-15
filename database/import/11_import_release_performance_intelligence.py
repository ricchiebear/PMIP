"""
11_import_release_performance_intelligence.py

Purpose
-------
Import PMIP Release Performance Intelligence results into MySQL/MariaDB.

Important identity rule
-----------------------
The release-performance notebook contains a column called `release_id`,
but inspection showed that its values are ISRC-style identifiers such as:

    USUG12400910
    USSM12209777

These are NOT the integer `release_id` values used by the PMIP
`releases` database table.

Therefore:

    source release_id / ISRC
            |
            v
       PMIP tracks.isrc
            |
            v
         track_id
            |
            v
       release_tracks
            |
            v
         release_id

The original source identity is always preserved in:
    release_performance_intelligence.source_release_id

Even if a source row cannot be linked to a PMIP track or release,
the intelligence row is still stored.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path
from typing import Any

import mysql.connector
import pandas as pd
from dotenv import load_dotenv


# =============================================================================
# 1. PROJECT PATHS
# =============================================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

SOURCE_FILE = (
    PROJECT_ROOT
    / "models"
    / "release_performance_scoring"
    / "results"
    / "release_intelligence_results.csv"
)

REPORT_DIR = PROJECT_ROOT / "database" / "import" / "reports"

UNMATCHED_TRACK_REPORT = (
    REPORT_DIR / "11_unmatched_release_performance_tracks.csv"
)

UNMATCHED_RELEASE_REPORT = (
    REPORT_DIR / "11_unmatched_release_performance_releases.csv"
)

ENV_FILE = PROJECT_ROOT / ".env"

REPORT_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(ENV_FILE)


# =============================================================================
# 2. CONFIGURATION
# =============================================================================

COMPONENT_NAME = "release_performance_intelligence"
COMPONENT_VERSION = "1.0"

BATCH_SIZE = 250


# =============================================================================
# 3. DISPLAY HELPERS
# =============================================================================

def heading(text: str) -> None:
    print()
    print(text)
    print("=" * 100)


def subheading(text: str) -> None:
    print()
    print(text)
    print("-" * 100)


# =============================================================================
# 4. GENERAL CLEANING HELPERS
# =============================================================================

def clean_text(value: Any) -> str | None:
    """
    Convert a value to stripped text.

    Returns None for:
    - None
    - NaN
    - empty strings
    - textual 'nan'
    """
    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except Exception:
        pass

    text = str(value).strip()

    if not text:
        return None

    if text.lower() in {"nan", "none", "null", "<na>"}:
        return None

    return text


def normalise_identifier(value: Any) -> str | None:
    """
    Normalise ISRC/source identifiers for matching.

    Examples:
        US-UG1-24-00910 -> USUG12400910
        usug12400910    -> USUG12400910

    Removes punctuation and whitespace while retaining letters/numbers.
    """
    text = clean_text(value)

    if text is None:
        return None

    normalised = re.sub(r"[^A-Za-z0-9]", "", text).upper()

    return normalised if normalised else None


def to_float(value: Any) -> float | None:
    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except Exception:
        pass

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def to_int(value: Any) -> int | None:
    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except Exception:
        pass

    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def to_bool_int(value: Any) -> int:
    """
    Convert common boolean forms to MySQL-compatible 0/1.
    """
    if value is None:
        return 0

    try:
        if pd.isna(value):
            return 0
    except Exception:
        pass

    if isinstance(value, bool):
        return int(value)

    if isinstance(value, (int, float)):
        return 1 if value != 0 else 0

    text = str(value).strip().lower()

    if text in {
        "true",
        "1",
        "yes",
        "y",
        "t",
        "high",
        "required",
    }:
        return 1

    return 0


# =============================================================================
# 5. FLEXIBLE COLUMN LOOKUP
# =============================================================================

def column_key(name: str) -> str:
    """
    Convert a column name to a comparison-safe form.

    Example:
        'Release Rank Position' -> releaserankposition
        'release_rank_position' -> releaserankposition
    """
    return re.sub(r"[^a-z0-9]", "", str(name).lower())


def find_column(
    dataframe: pd.DataFrame,
    candidates: list[str],
    required: bool = False,
) -> str | None:
    """
    Locate a source column using case/punctuation-insensitive matching.
    """
    available = {
        column_key(column): column
        for column in dataframe.columns
    }

    for candidate in candidates:
        key = column_key(candidate)

        if key in available:
            return available[key]

    if required:
        raise KeyError(
            "Could not find required source column. "
            f"Tried: {candidates}"
        )

    return None


def value_from(
    row: pd.Series,
    column_name: str | None,
) -> Any:
    if column_name is None:
        return None

    return row.get(column_name)


# =============================================================================
# 6. DATABASE CONNECTION
# =============================================================================

def connect_database():
    required_env = [
        "DB_HOST",
        "DB_PORT",
        "DB_NAME",
        "DB_USER",
        "DB_PASSWORD",
    ]

    missing = [
        variable
        for variable in required_env
        if not os.getenv(variable)
    ]

    if missing:
        raise RuntimeError(
            "Missing database environment variables: "
            + ", ".join(missing)
        )

    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        autocommit=False,
    )


# =============================================================================
# 7. SOURCE DATA
# =============================================================================

heading("PMIP Release Performance Intelligence Import")

print(f"Project root: {PROJECT_ROOT}")
print(f"Source file: {SOURCE_FILE}")

if not SOURCE_FILE.exists():
    raise FileNotFoundError(
        f"Release intelligence file not found:\n{SOURCE_FILE}"
    )

df = pd.read_csv(SOURCE_FILE, low_memory=False)

heading("Release-performance source")

print(f"Source rows: {len(df):,}")
print(f"Source columns: {len(df.columns):,}")

print()
print("Columns:")
for column in df.columns:
    print(f"  - {column}")


# =============================================================================
# 8. IDENTIFY SOURCE COLUMNS
# =============================================================================

heading("Source-column mapping")

source_release_col = find_column(
    df,
    [
        "release_id",
        "ISRC_clean",
        "ISRC",
        "source_release_id",
    ],
    required=True,
)

source_track_col = find_column(
    df,
    [
        "track_id",
        "source_track_id",
    ],
)

track_name_col = find_column(
    df,
    [
        "Track",
        "track_name",
        "track",
    ],
)

artist_col = find_column(
    df,
    [
        "Artist",
        "artist",
        "artists",
    ],
)

album_col = find_column(
    df,
    [
        "Album Name",
        "album_name",
        "release_title",
    ],
)

isrc_col = find_column(
    df,
    [
        "ISRC_clean",
        "ISRC",
    ],
)

streaming_performance_col = find_column(
    df,
    [
        "streaming_performance_score",
        "streaming performance score",
    ],
)

chart_performance_col = find_column(
    df,
    [
        "chart_performance_score",
        "chart performance score",
    ],
)

geographic_reach_col = find_column(
    df,
    [
        "geographic_reach_score",
        "geographic reach score",
    ],
)

temporal_comparability_col = find_column(
    df,
    [
        "temporal_comparability_score",
        "temporal comparability score",
    ],
)

artist_release_relationship_col = find_column(
    df,
    [
        "artist_release_relationship_score",
        "artist release relationship score",
    ],
)

unusual_performance_score_col = find_column(
    df,
    [
        "unusual_performance_score",
        "unusual performance score",
    ],
)

composite_score_col = find_column(
    df,
    [
        "composite_release_performance_score",
        "composite release performance score",
    ],
    required=True,
)

composite_percentile_col = find_column(
    df,
    [
        "composite_release_performance_percentile",
        "release_performance_percentile",
        "composite release performance percentile",
    ],
)

release_rank_col = find_column(
    df,
    [
        "release_rank_position",
        "composite_release_performance_rank",
        "release_rank",
    ],
)

release_performance_class_col = find_column(
    df,
    [
        "release_performance_class",
        "release performance class",
    ],
)

release_percentile_group_col = find_column(
    df,
    [
        "release_percentile_group",
        "release percentile group",
    ],
)

weight_coverage_col = find_column(
    df,
    [
        "composite_weight_coverage_pct",
        "release_performance_evidence_pct",
        "composite_weight_coverage",
    ],
)

evidence_strength_col = find_column(
    df,
    [
        "composite_evidence_strength",
        "release_performance_evidence_strength",
        "evidence_strength",
    ],
)

release_priority_class_col = find_column(
    df,
    [
        "release_priority_class",
        "release priority class",
    ],
)

priority_signal_score_col = find_column(
    df,
    [
        "priority_signal_score",
        "release_priority_signal_score",
        "priority score",
    ],
)

priority_signal_rank_col = find_column(
    df,
    [
        "priority_signal_rank",
        "release_priority_rank",
        "priority rank",
    ],
)

high_priority_flag_col = find_column(
    df,
    [
        "high_priority_release_flag",
        "high priority release flag",
    ],
)

priority_review_flag_col = find_column(
    df,
    [
        "priority_review_flag",
        "priority review flag",
    ],
)

unusual_performance_flag_col = find_column(
    df,
    [
        "unusual_performance_flag",
        "unusual performance flag",
    ],
)

human_review_required_col = find_column(
    df,
    [
        "human_review_required",
        "human review required",
    ],
)

human_review_trigger_count_col = find_column(
    df,
    [
        "human_review_trigger_count",
        "human review trigger count",
    ],
)

human_review_priority_col = find_column(
    df,
    [
        "human_review_priority",
        "human review priority",
    ],
)

human_review_reason_col = find_column(
    df,
    [
        "human_review_reason",
        "human review reason",
    ],
)


column_mapping = {
    "source release identity": source_release_col,
    "source track identity": source_track_col,
    "track name": track_name_col,
    "artist": artist_col,
    "album": album_col,
    "ISRC": isrc_col,
    "streaming performance": streaming_performance_col,
    "chart performance": chart_performance_col,
    "geographic reach": geographic_reach_col,
    "temporal comparability": temporal_comparability_col,
    "artist-release relationship": artist_release_relationship_col,
    "unusual performance score": unusual_performance_score_col,
    "composite score": composite_score_col,
    "composite percentile": composite_percentile_col,
    "release rank": release_rank_col,
    "release performance class": release_performance_class_col,
    "release percentile group": release_percentile_group_col,
    "weight coverage": weight_coverage_col,
    "evidence strength": evidence_strength_col,
    "release priority class": release_priority_class_col,
    "priority signal score": priority_signal_score_col,
    "priority signal rank": priority_signal_rank_col,
    "high-priority flag": high_priority_flag_col,
    "priority-review flag": priority_review_flag_col,
    "unusual-performance flag": unusual_performance_flag_col,
    "human-review required": human_review_required_col,
    "human-review trigger count": human_review_trigger_count_col,
    "human-review priority": human_review_priority_col,
    "human-review reason": human_review_reason_col,
}

for destination, source in column_mapping.items():
    print(
        f"{destination:<35} -> "
        f"{source if source is not None else '[not present]'}"
    )


# =============================================================================
# 9. PREPARE SOURCE IDENTITIES
# =============================================================================

heading("Release source-identity validation")

df["_source_release_id"] = df[source_release_col].apply(clean_text)
df["_source_release_key"] = df[source_release_col].apply(
    normalise_identifier
)

missing_source_identity = int(
    df["_source_release_id"].isna().sum()
)

duplicate_source_ids = int(
    df["_source_release_id"].duplicated(keep=False).sum()
)

duplicate_source_keys = int(
    df["_source_release_key"].duplicated(keep=False).sum()
)

print(f"Rows: {len(df):,}")
print(
    "Non-null source release identities: "
    f"{df['_source_release_id'].notna().sum():,}"
)
print(
    "Unique source release identities: "
    f"{df['_source_release_id'].nunique(dropna=True):,}"
)
print(
    "Unique normalised source identities: "
    f"{df['_source_release_key'].nunique(dropna=True):,}"
)
print(
    f"Missing source identities: {missing_source_identity:,}"
)
print(
    f"Rows involved in exact source duplicates: "
    f"{duplicate_source_ids:,}"
)
print(
    f"Rows involved in normalised source collisions: "
    f"{duplicate_source_keys:,}"
)

if missing_source_identity > 0:
    raise RuntimeError(
        "Release import cannot continue because one or more rows "
        "do not have a source release identity."
    )

if df["_source_release_id"].duplicated().any():
    duplicates = df[
        df["_source_release_id"].duplicated(keep=False)
    ]

    print()
    print("Duplicate source identities:")
    print(
        duplicates[
            [
                "_source_release_id",
                track_name_col,
                artist_col,
            ]
        ].head(50).to_string(index=False)
    )

    raise RuntimeError(
        "Duplicate source_release_id values were found. "
        "Import stopped to protect source-row identity."
    )


# =============================================================================
# 10. CONNECT TO DATABASE
# =============================================================================

connection = None
cursor = None
run_id = None

try:
    heading("Database connection")

    connection = connect_database()

    cursor = connection.cursor(dictionary=True)

    print("PMIP database connection successful.")


    # =========================================================================
    # 11. LOAD PMIP TRACK IDENTITIES
    # =========================================================================

    heading("PMIP track identity mapping")

    cursor.execute(
        """
        SELECT
            track_id,
            source_track_id,
            isrc,
            track_name
        FROM tracks
        """
    )

    track_rows = cursor.fetchall()

    print(f"Database tracks loaded: {len(track_rows):,}")

    isrc_to_track_ids: dict[str, list[int]] = {}
    source_track_to_track_ids: dict[str, list[int]] = {}

    for db_row in track_rows:
        db_track_id = int(db_row["track_id"])

        db_isrc_key = normalise_identifier(db_row["isrc"])

        if db_isrc_key:
            isrc_to_track_ids.setdefault(
                db_isrc_key,
                [],
            ).append(db_track_id)

        db_source_key = clean_text(db_row["source_track_id"])

        if db_source_key:
            source_track_to_track_ids.setdefault(
                db_source_key,
                [],
            ).append(db_track_id)

    unique_isrc_map = {
        key: values[0]
        for key, values in isrc_to_track_ids.items()
        if len(set(values)) == 1
    }

    ambiguous_isrc_keys = {
        key
        for key, values in isrc_to_track_ids.items()
        if len(set(values)) > 1
    }

    unique_source_track_map = {
        key: values[0]
        for key, values in source_track_to_track_ids.items()
        if len(set(values)) == 1
    }

    ambiguous_source_track_keys = {
        key
        for key, values in source_track_to_track_ids.items()
        if len(set(values)) > 1
    }

    print(
        f"Unique ISRC mappings: {len(unique_isrc_map):,}"
    )
    print(
        f"Ambiguous ISRC identities: {len(ambiguous_isrc_keys):,}"
    )
    print(
        "Unique source-track mappings: "
        f"{len(unique_source_track_map):,}"
    )
    print(
        "Ambiguous source-track identities: "
        f"{len(ambiguous_source_track_keys):,}"
    )


    # =========================================================================
    # 12. LOAD TRACK -> RELEASE RELATIONSHIPS
    # =========================================================================

    heading("PMIP track-to-release mapping")

    cursor.execute(
        """
        SELECT
            track_id,
            release_id
        FROM release_tracks
        ORDER BY
            track_id,
            release_id
        """
    )

    release_track_rows = cursor.fetchall()

    track_to_release_ids: dict[int, list[int]] = {}

    for db_row in release_track_rows:
        track_id = int(db_row["track_id"])
        release_id = int(db_row["release_id"])

        track_to_release_ids.setdefault(
            track_id,
            [],
        ).append(release_id)

    unique_track_release_map = {
        track_id: release_ids[0]
        for track_id, release_ids in track_to_release_ids.items()
        if len(set(release_ids)) == 1
    }

    ambiguous_track_release_map = {
        track_id: sorted(set(release_ids))
        for track_id, release_ids in track_to_release_ids.items()
        if len(set(release_ids)) > 1
    }

    print(
        "Tracks with one PMIP release: "
        f"{len(unique_track_release_map):,}"
    )
    print(
        "Tracks connected to multiple PMIP releases: "
        f"{len(ambiguous_track_release_map):,}"
    )


    # =========================================================================
    # 13. RESOLVE SOURCE ROWS TO PMIP TRACKS / RELEASES
    # =========================================================================

    heading("Release identity resolution")

    resolved_rows = []

    matched_track_count = 0
    unmatched_track_count = 0
    ambiguous_track_count = 0

    matched_release_count = 0
    unmatched_release_count = 0
    ambiguous_release_count = 0

    for source_index, row in df.iterrows():

        source_release_id = row["_source_release_id"]
        source_release_key = row["_source_release_key"]

        resolved_track_id = None
        resolved_release_id = None

        track_match_method = None
        release_match_status = None

        # ---------------------------------------------------------------------
        # Primary match: source release ID / ISRC -> tracks.isrc
        # ---------------------------------------------------------------------

        if source_release_key in unique_isrc_map:
            resolved_track_id = unique_isrc_map[
                source_release_key
            ]
            track_match_method = "isrc"

        elif source_release_key in ambiguous_isrc_keys:
            ambiguous_track_count += 1
            track_match_method = "ambiguous_isrc"

        # ---------------------------------------------------------------------
        # Secondary fallback: explicit source track ID if the source file
        # provides one and it matches tracks.source_track_id.
        # ---------------------------------------------------------------------

        if (
            resolved_track_id is None
            and track_match_method != "ambiguous_isrc"
            and source_track_col is not None
        ):
            explicit_source_track = clean_text(
                value_from(row, source_track_col)
            )

            if (
                explicit_source_track
                and explicit_source_track
                in unique_source_track_map
            ):
                resolved_track_id = unique_source_track_map[
                    explicit_source_track
                ]
                track_match_method = "source_track_id"

            elif (
                explicit_source_track
                and explicit_source_track
                in ambiguous_source_track_keys
            ):
                ambiguous_track_count += 1
                track_match_method = (
                    "ambiguous_source_track_id"
                )

        # ---------------------------------------------------------------------
        # Resolve PMIP release through release_tracks
        # ---------------------------------------------------------------------

        if resolved_track_id is not None:
            matched_track_count += 1

            if resolved_track_id in unique_track_release_map:
                resolved_release_id = (
                    unique_track_release_map[
                        resolved_track_id
                    ]
                )

                matched_release_count += 1
                release_match_status = "matched"

            elif resolved_track_id in ambiguous_track_release_map:
                ambiguous_release_count += 1
                release_match_status = "ambiguous"

            else:
                unmatched_release_count += 1
                release_match_status = "no_release_link"

        else:
            unmatched_track_count += 1
            unmatched_release_count += 1
            release_match_status = "no_track_match"

        resolved_rows.append(
            {
                "source_index": source_index,
                "source_release_id": source_release_id,
                "source_release_key": source_release_key,
                "track_id": resolved_track_id,
                "release_id": resolved_release_id,
                "track_match_method": track_match_method,
                "release_match_status": release_match_status,
                "track_name": clean_text(
                    value_from(row, track_name_col)
                ),
                "artist": clean_text(
                    value_from(row, artist_col)
                ),
                "album_name": clean_text(
                    value_from(row, album_col)
                ),
            }
        )

    resolution_df = pd.DataFrame(resolved_rows)

    print(f"Source rows: {len(df):,}")
    print(
        f"Rows linked to PMIP tracks: "
        f"{matched_track_count:,}"
    )
    print(
        f"Rows without PMIP track match: "
        f"{unmatched_track_count:,}"
    )
    print(
        f"Ambiguous PMIP track identities: "
        f"{ambiguous_track_count:,}"
    )
    print(
        f"Rows linked to PMIP releases: "
        f"{matched_release_count:,}"
    )
    print(
        f"Rows without direct PMIP release link: "
        f"{unmatched_release_count:,}"
    )
    print(
        f"Ambiguous track-to-release links: "
        f"{ambiguous_release_count:,}"
    )

    track_coverage = (
        matched_track_count / len(df) * 100
        if len(df)
        else 0
    )

    release_coverage = (
        matched_release_count / len(df) * 100
        if len(df)
        else 0
    )

    print(
        f"Track-link coverage: "
        f"{track_coverage:.4f}%"
    )
    print(
        f"Release-link coverage: "
        f"{release_coverage:.4f}%"
    )


    # =========================================================================
    # 14. SAVE AUDIT REPORTS
    # =========================================================================

    unmatched_track_df = resolution_df[
        resolution_df["track_id"].isna()
    ].copy()

    unmatched_release_df = resolution_df[
        resolution_df["release_id"].isna()
    ].copy()

    unmatched_track_df.to_csv(
        UNMATCHED_TRACK_REPORT,
        index=False,
    )

    unmatched_release_df.to_csv(
        UNMATCHED_RELEASE_REPORT,
        index=False,
    )

    print()
    print(
        "Unmatched-track audit report:"
    )
    print(UNMATCHED_TRACK_REPORT)

    print()
    print(
        "Unmatched-release audit report:"
    )
    print(UNMATCHED_RELEASE_REPORT)


    # =========================================================================
    # 15. CREATE INTELLIGENCE RUN
    # =========================================================================

    heading("Creating intelligence run")

    cursor.execute(
        """
        INSERT INTO intelligence_runs (
            component_name,
            component_version
        )
        VALUES (%s, %s)
        """,
        (
            COMPONENT_NAME,
            COMPONENT_VERSION,
        ),
    )

    run_id = cursor.lastrowid

    print(f"New intelligence run created: {run_id}")


    # =========================================================================
    # 16. PREPARE INSERT DATA
    # =========================================================================

    heading("Preparing release intelligence rows")

    resolved_lookup = {
        int(row["source_index"]): row
        for _, row in resolution_df.iterrows()
    }

    insert_rows = []

    for source_index, row in df.iterrows():

        mapping = resolved_lookup[source_index]

        insert_rows.append(
            (
                mapping["source_release_id"],
                (
                    int(mapping["track_id"])
                    if pd.notna(mapping["track_id"])
                    else None
                ),
                (
                    int(mapping["release_id"])
                    if pd.notna(mapping["release_id"])
                    else None
                ),
                run_id,

                to_float(
                    value_from(
                        row,
                        streaming_performance_col,
                    )
                ),

                to_float(
                    value_from(
                        row,
                        chart_performance_col,
                    )
                ),

                to_float(
                    value_from(
                        row,
                        geographic_reach_col,
                    )
                ),

                to_float(
                    value_from(
                        row,
                        temporal_comparability_col,
                    )
                ),

                to_float(
                    value_from(
                        row,
                        artist_release_relationship_col,
                    )
                ),

                to_float(
                    value_from(
                        row,
                        unusual_performance_score_col,
                    )
                ),

                to_float(
                    value_from(
                        row,
                        composite_score_col,
                    )
                ),

                to_float(
                    value_from(
                        row,
                        composite_percentile_col,
                    )
                ),

                to_int(
                    value_from(
                        row,
                        release_rank_col,
                    )
                ),

                clean_text(
                    value_from(
                        row,
                        release_performance_class_col,
                    )
                ),

                clean_text(
                    value_from(
                        row,
                        release_percentile_group_col,
                    )
                ),

                to_float(
                    value_from(
                        row,
                        weight_coverage_col,
                    )
                ),

                clean_text(
                    value_from(
                        row,
                        evidence_strength_col,
                    )
                ),

                clean_text(
                    value_from(
                        row,
                        release_priority_class_col,
                    )
                ),

                to_float(
                    value_from(
                        row,
                        priority_signal_score_col,
                    )
                ),

                to_int(
                    value_from(
                        row,
                        priority_signal_rank_col,
                    )
                ),

                to_bool_int(
                    value_from(
                        row,
                        high_priority_flag_col,
                    )
                ),

                to_bool_int(
                    value_from(
                        row,
                        priority_review_flag_col,
                    )
                ),

                to_bool_int(
                    value_from(
                        row,
                        unusual_performance_flag_col,
                    )
                ),

                to_bool_int(
                    value_from(
                        row,
                        human_review_required_col,
                    )
                ),

                to_int(
                    value_from(
                        row,
                        human_review_trigger_count_col,
                    )
                ),

                clean_text(
                    value_from(
                        row,
                        human_review_priority_col,
                    )
                ),

                clean_text(
                    value_from(
                        row,
                        human_review_reason_col,
                    )
                ),
            )
        )

    print(
        f"Release intelligence rows prepared: "
        f"{len(insert_rows):,}"
    )


    # =========================================================================
    # 17. INSERT INTO DATABASE
    # =========================================================================

    heading("Importing release performance intelligence")

    insert_sql = """
        INSERT INTO release_performance_intelligence (
            source_release_id,
            track_id,
            release_id,
            run_id,
            streaming_performance_score,
            chart_performance_score,
            geographic_reach_score,
            temporal_comparability_score,
            artist_release_relationship_score,
            unusual_performance_score,
            composite_release_performance_score,
            composite_release_performance_percentile,
            release_rank_position,
            release_performance_class,
            release_percentile_group,
            composite_weight_coverage_pct,
            composite_evidence_strength,
            release_priority_class,
            priority_signal_score,
            priority_signal_rank,
            high_priority_release_flag,
            priority_review_flag,
            unusual_performance_flag,
            human_review_required,
            human_review_trigger_count,
            human_review_priority,
            human_review_reason
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s
        )
    """

    total_inserted = 0

    total_batches = (
        len(insert_rows) + BATCH_SIZE - 1
    ) // BATCH_SIZE

    for batch_number, start in enumerate(
        range(0, len(insert_rows), BATCH_SIZE),
        start=1,
    ):
        batch = insert_rows[
            start:start + BATCH_SIZE
        ]

        cursor.executemany(
            insert_sql,
            batch,
        )

        total_inserted += len(batch)

        print(
            f"Batch {batch_number:03d}/{total_batches:03d}"
            f" | inserted={len(batch):,}"
            f" | total={total_inserted:,}"
        )


    # =========================================================================
    # 18. DATABASE VALIDATION
    # =========================================================================

    heading("Release-performance database validation")

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM release_performance_intelligence
        WHERE run_id = %s
        """,
        (run_id,),
    )

    stored_count = cursor.fetchone()["row_count"]

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM release_performance_intelligence
        WHERE
            run_id = %s
            AND track_id IS NOT NULL
        """,
        (run_id,),
    )

    stored_track_links = cursor.fetchone()["row_count"]

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM release_performance_intelligence
        WHERE
            run_id = %s
            AND release_id IS NOT NULL
        """,
        (run_id,),
    )

    stored_release_links = cursor.fetchone()["row_count"]

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM release_performance_intelligence
        WHERE
            run_id = %s
            AND (
                source_release_id IS NULL
                OR TRIM(source_release_id) = ''
            )
        """,
        (run_id,),
    )

    missing_source_ids_db = cursor.fetchone()["row_count"]

    cursor.execute(
        """
        SELECT COUNT(*) AS duplicate_groups
        FROM (
            SELECT
                source_release_id,
                run_id,
                COUNT(*) AS occurrences
            FROM release_performance_intelligence
            WHERE run_id = %s
            GROUP BY
                source_release_id,
                run_id
            HAVING COUNT(*) > 1
        ) duplicate_rows
        """,
        (run_id,),
    )

    duplicate_source_groups = cursor.fetchone()[
        "duplicate_groups"
    ]

    cursor.execute(
        """
        SELECT COUNT(*) AS orphan_count
        FROM release_performance_intelligence rpi
        LEFT JOIN tracks t
            ON t.track_id = rpi.track_id
        WHERE
            rpi.run_id = %s
            AND rpi.track_id IS NOT NULL
            AND t.track_id IS NULL
        """,
        (run_id,),
    )

    orphan_track_links = cursor.fetchone()["orphan_count"]

    cursor.execute(
        """
        SELECT COUNT(*) AS orphan_count
        FROM release_performance_intelligence rpi
        LEFT JOIN releases r
            ON r.release_id = rpi.release_id
        WHERE
            rpi.run_id = %s
            AND rpi.release_id IS NOT NULL
            AND r.release_id IS NULL
        """,
        (run_id,),
    )

    orphan_release_links = cursor.fetchone()["orphan_count"]

    print(
        f"Release intelligence rows stored: "
        f"{stored_count:,}"
    )

    print(
        f"Rows linked to PMIP tracks: "
        f"{stored_track_links:,}"
    )

    print(
        f"Rows linked to PMIP releases: "
        f"{stored_release_links:,}"
    )

    print(
        f"Missing source_release_id values: "
        f"{missing_source_ids_db:,}"
    )

    print(
        f"Duplicate source identity groups: "
        f"{duplicate_source_groups:,}"
    )

    print(
        f"Orphan track references: "
        f"{orphan_track_links:,}"
    )

    print(
        f"Orphan release references: "
        f"{orphan_release_links:,}"
    )


    # =========================================================================
    # 19. FINAL CHECKLIST
    # =========================================================================

    heading("Final release-performance intelligence checklist")

    checks = {
        "Stored row count matches source row count":
            stored_count == len(df),

        "All source release identities preserved":
            missing_source_ids_db == 0,

        "No duplicate source identities":
            duplicate_source_groups == 0,

        "No orphan mapped track IDs":
            orphan_track_links == 0,

        "No orphan mapped release IDs":
            orphan_release_links == 0,

        "Stored track-link count matches prepared mapping":
            stored_track_links == matched_track_count,

        "Stored release-link count matches prepared mapping":
            stored_release_links == matched_release_count,
    }

    for description, passed in checks.items():
        print(
            f"{description}: {passed}"
        )

    all_checks_passed = all(checks.values())

    if not all_checks_passed:
        raise RuntimeError(
            "Release-performance validation failed. "
            "The transaction will be rolled back."
        )


    # =========================================================================
    # 20. COMMIT
    # =========================================================================

    connection.commit()

    heading("Release-performance intelligence import result")

    print(
        "Result: PMIP RELEASE PERFORMANCE INTELLIGENCE "
        "IMPORTED SUCCESSFULLY"
    )

    print(f"Intelligence run: {run_id}")

    print(
        f"Release intelligence source rows: "
        f"{len(df):,}"
    )

    print(
        f"Release intelligence rows stored: "
        f"{stored_count:,}"
    )

    print(
        f"Rows linked to PMIP tracks: "
        f"{stored_track_links:,}"
    )

    print(
        f"Rows linked to PMIP releases: "
        f"{stored_release_links:,}"
    )

    print(
        "All original notebook release identities were preserved "
        "in source_release_id."
    )

    print(
        "Unmatched identities remain stored rather than being "
        "discarded."
    )

    print(
        "Release performance intelligence import is now complete."
    )


# =============================================================================
# 21. ERROR HANDLING
# =============================================================================

except Exception as error:

    if connection is not None:
        try:
            connection.rollback()
        except Exception:
            pass

    heading("IMPORT ERROR")

    print(
        f"{type(error).__name__}: {error}"
    )

    if run_id is not None:
        print()
        print(
            "The attempted intelligence run was rolled back:"
        )
        print(f"run_id = {run_id}")

    print()
    print(
        "No partially completed release-performance import "
        "should remain because this script commits only after "
        "all validation checks pass."
    )

    raise


# =============================================================================
# 22. CLEANUP
# =============================================================================

finally:

    if cursor is not None:
        try:
            cursor.close()
        except Exception:
            pass

    if connection is not None:
        try:
            connection.close()
            print()
            print("Database connection closed.")
        except Exception:
            pass