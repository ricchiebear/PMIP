from pathlib import Path
import os

import pandas as pd
import mysql.connector
from dotenv import load_dotenv


# ============================================================
# 1. Project paths
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ENV_PATH = PROJECT_ROOT / ".env"

CHARTS_PATH = (
    PROJECT_ROOT
    / "data"
    / "processed"
    / "charts_cleaned.csv"
)

load_dotenv(ENV_PATH)


# ============================================================
# 2. Database configuration
# ============================================================

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT")),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


# ============================================================
# 3. Connect to PMIP database
# ============================================================

connection = mysql.connector.connect(
    **DB_CONFIG
)

cursor = connection.cursor()


# ============================================================
# 4. Recover tracks without artists
# ============================================================

cursor.execute(
    """
    SELECT
        t.track_id,
        t.source_track_id,
        t.track_name
    FROM tracks t
    LEFT JOIN track_artists ta
        ON t.track_id = ta.track_id
    WHERE ta.track_id IS NULL
      AND t.source_track_id IS NOT NULL
      AND t.isrc IS NULL
    ORDER BY t.track_id
    """
)

missing_tracks = cursor.fetchall()

missing_df = pd.DataFrame(
    missing_tracks,
    columns=[
        "database_track_id",
        "source_track_id",
        "database_track_name",
    ],
)

print()
print("Tracks without artist relationships")
print("=" * 75)

print(
    f"Tracks found: "
    f"{len(missing_df):,}"
)


# ============================================================
# 5. Prepare lookup set
# ============================================================

source_track_ids = set(
    missing_df[
        "source_track_id"
    ]
    .astype(str)
    .str.strip()
)


# ============================================================
# 6. Scan charts_cleaned.csv in chunks
# ============================================================

print()
print("Searching original chart artist values...")
print("=" * 75)

matches = []

CHUNK_SIZE = 100_000

for chunk_number, chunk in enumerate(
    pd.read_csv(
        CHARTS_PATH,
        usecols=[
            "track_id",
            "name",
            "artists",
        ],
        chunksize=CHUNK_SIZE,
    ),
    start=1,
):

    chunk[
        "track_id"
    ] = (
        chunk[
            "track_id"
        ]
        .astype(str)
        .str.strip()
    )

    matched_chunk = (
        chunk[
            chunk[
                "track_id"
            ].isin(
                source_track_ids
            )
        ]
        .copy()
    )

    if not matched_chunk.empty:

        matches.append(
            matched_chunk
        )

    print(
        f"Chunk {chunk_number:,} checked"
    )


# ============================================================
# 7. Combine recovered source records
# ============================================================

if matches:

    source_matches_df = (
        pd.concat(
            matches,
            ignore_index=True,
        )
        .drop_duplicates(
            subset=[
                "track_id",
                "artists",
            ]
        )
    )

else:

    source_matches_df = pd.DataFrame(
        columns=[
            "track_id",
            "name",
            "artists",
        ]
    )


# ============================================================
# 8. Merge database and source information
# ============================================================

diagnostic_df = (
    missing_df.merge(
        source_matches_df,
        left_on="source_track_id",
        right_on="track_id",
        how="left",
    )
)


# ============================================================
# 9. Diagnostics
# ============================================================

print()
print("Missing artist diagnostic summary")
print("=" * 75)

print(
    f"Database tracks without artists: "
    f"{len(missing_df):,}"
)

print(
    f"Tracks found in charts_cleaned: "
    f"{diagnostic_df['artists'].notna().sum():,}"
)

print(
    f"Tracks still missing source artist data: "
    f"{diagnostic_df['artists'].isna().sum():,}"
)


# ============================================================
# 10. Show sample
# ============================================================

print()
print("Sample source artist values")
print("=" * 75)

sample_df = (
    diagnostic_df[
        [
            "database_track_id",
            "source_track_id",
            "database_track_name",
            "artists",
        ]
    ]
    .head(50)
)

print(
    sample_df.to_string(
        index=False
    )
)


# ============================================================
# 11. Save diagnostic output
# ============================================================

OUTPUT_PATH = (
    PROJECT_ROOT
    / "database"
    / "import"
    / "missing_track_artist_diagnostics.csv"
)

diagnostic_df.to_csv(
    OUTPUT_PATH,
    index=False,
)

print()
print(
    f"Diagnostic CSV saved to: "
    f"{OUTPUT_PATH}"
)


# ============================================================
# 12. Close database connection
# ============================================================

cursor.close()
connection.close()

print()
print(
    "Diagnostic complete."
)