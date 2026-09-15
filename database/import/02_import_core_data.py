from pathlib import Path
import os

import pandas as pd
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv


# ============================================================
# 1. Project paths
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ENV_PATH = PROJECT_ROOT / ".env"

SOURCE_PATH = (
    PROJECT_ROOT
    / "data"
    / "integrated"
    / "spotify_integrated.csv"
)

load_dotenv(ENV_PATH)


# ============================================================
# 2. Database connection settings
# ============================================================

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT")),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


# ============================================================
# 3. Load source dataset
# ============================================================

print("\nLoading PMIP integrated dataset...")
print("=" * 60)

df = pd.read_csv(SOURCE_PATH)

print(f"Source file: {SOURCE_PATH}")
print(f"Rows loaded: {len(df):,}")
print(f"Columns loaded: {len(df.columns):,}")


# ============================================================
# 4. Validate required columns
# ============================================================

required_columns = [
    "Track",
    "Album Name",
    "Artist",
    "Release Date",
    "ISRC",
]

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:
    raise ValueError(
        f"Missing required columns: {missing_columns}"
    )

print("\nRequired columns validated successfully.")


# ============================================================
# 5. Prepare clean core data
# ============================================================

core_df = df[
    required_columns
].copy()

core_df["Track"] = (
    core_df["Track"]
    .astype(str)
    .str.strip()
)

core_df["Album Name"] = (
    core_df["Album Name"]
    .astype(str)
    .str.strip()
)

core_df["Artist"] = (
    core_df["Artist"]
    .astype(str)
    .str.strip()
)

core_df["ISRC"] = (
    core_df["ISRC"]
    .astype(str)
    .str.strip()
)

core_df["Release Date"] = pd.to_datetime(
    core_df["Release Date"],
    errors="coerce",
).dt.date


# ============================================================
# 6. Connect to PMIP database
# ============================================================

connection = None
cursor = None

try:
    connection = mysql.connector.connect(**DB_CONFIG)

    cursor = connection.cursor()

    print("\nPMIP database connection successful.")


    # ========================================================
    # 7. Import artists
    # ========================================================

    print("\nImporting artists...")
    print("=" * 60)

    artist_names = (
        core_df["Artist"]
        .dropna()
        .loc[
            lambda series:
            series.str.len() > 0
        ]
        .drop_duplicates()
        .tolist()
    )

    artist_insert_sql = """
        INSERT INTO artists (
            artist_name
        )
        VALUES (%s)
    """

    artist_lookup = {}

    for artist_name in artist_names:

        cursor.execute(
            """
            SELECT artist_id
            FROM artists
            WHERE artist_name = %s
            LIMIT 1
            """,
            (artist_name,),
        )

        existing_artist = cursor.fetchone()

        if existing_artist:
            artist_id = existing_artist[0]

        else:
            cursor.execute(
                artist_insert_sql,
                (artist_name,),
            )

            artist_id = cursor.lastrowid

        artist_lookup[artist_name] = artist_id

    connection.commit()

    print(
        f"Artists available in lookup: "
        f"{len(artist_lookup):,}"
    )


    # ========================================================
    # 8. Import tracks
    # ========================================================

    print("\nImporting tracks...")
    print("=" * 60)

    track_insert_sql = """
        INSERT INTO tracks (
            source_track_id,
            isrc,
            track_name
        )
        VALUES (%s, %s, %s)
    """

    track_lookup = {}

    for _, row in core_df.iterrows():

        track_name = row["Track"]
        isrc = row["ISRC"]

        if not track_name:
            continue

        cursor.execute(
            """
            SELECT track_id
            FROM tracks
            WHERE isrc = %s
            LIMIT 1
            """,
            (isrc,),
        )

        existing_track = cursor.fetchone()

        if existing_track:
            track_id = existing_track[0]

        else:
            cursor.execute(
                track_insert_sql,
                (
                    isrc,
                    isrc,
                    track_name,
                ),
            )

            track_id = cursor.lastrowid

        track_lookup[isrc] = track_id

    connection.commit()

    print(
        f"Tracks available in lookup: "
        f"{len(track_lookup):,}"
    )


    # ========================================================
    # 9. Import track-artist relationships
    # ========================================================

    print("\nImporting track-artist relationships...")
    print("=" * 60)

    track_artist_insert_sql = """
        INSERT IGNORE INTO track_artists (
            track_id,
            artist_id
        )
        VALUES (%s, %s)
    """

    relationship_count = 0

    for _, row in core_df.iterrows():

        isrc = row["ISRC"]
        artist_name = row["Artist"]

        track_id = track_lookup.get(isrc)
        artist_id = artist_lookup.get(artist_name)

        if track_id is None or artist_id is None:
            continue

        cursor.execute(
            track_artist_insert_sql,
            (
                track_id,
                artist_id,
            ),
        )

        relationship_count += 1

    connection.commit()

    print(
        f"Track-artist relationships processed: "
        f"{relationship_count:,}"
    )


    # ========================================================
    # 10. Import releases
    # ========================================================

    print("\nImporting releases...")
    print("=" * 60)

    release_insert_sql = """
        INSERT INTO releases (
            release_title,
            release_date,
            release_type
        )
        VALUES (%s, %s, %s)
    """

    release_lookup = {}

    for _, row in core_df.iterrows():

        release_title = row["Album Name"]
        release_date = row["Release Date"]

        release_key = (
            release_title,
            release_date,
        )

        if release_key in release_lookup:
            continue

        cursor.execute(
            """
            SELECT release_id
            FROM releases
            WHERE release_title = %s
              AND release_date <=> %s
            LIMIT 1
            """,
            (
                release_title,
                release_date,
            ),
        )

        existing_release = cursor.fetchone()

        if existing_release:
            release_id = existing_release[0]

        else:
            cursor.execute(
                release_insert_sql,
                (
                    release_title,
                    release_date,
                    None,
                ),
            )

            release_id = cursor.lastrowid

        release_lookup[release_key] = release_id

    connection.commit()

    print(
        f"Releases available in lookup: "
        f"{len(release_lookup):,}"
    )


    # ========================================================
    # 11. Import release-track relationships
    # ========================================================

    print("\nImporting release-track relationships...")
    print("=" * 60)

    release_track_insert_sql = """
        INSERT IGNORE INTO release_tracks (
            release_id,
            track_id
        )
        VALUES (%s, %s)
    """

    release_track_count = 0

    for _, row in core_df.iterrows():

        release_key = (
            row["Album Name"],
            row["Release Date"],
        )

        release_id = release_lookup.get(
            release_key
        )

        track_id = track_lookup.get(
            row["ISRC"]
        )

        if release_id is None or track_id is None:
            continue

        cursor.execute(
            release_track_insert_sql,
            (
                release_id,
                track_id,
            ),
        )

        release_track_count += 1

    connection.commit()

    print(
        f"Release-track relationships processed: "
        f"{release_track_count:,}"
    )


    # ========================================================
    # 12. Final database counts
    # ========================================================

    print("\nFinal core database counts")
    print("=" * 60)

    tables = [
        "artists",
        "tracks",
        "track_artists",
        "releases",
        "release_tracks",
    ]

    for table in tables:

        cursor.execute(
            f"SELECT COUNT(*) FROM {table}"
        )

        count = cursor.fetchone()[0]

        print(
            f"{table}: {count:,}"
        )


    print("\nCore PMIP data import completed successfully.")


except Error as error:

    if connection is not None:
        connection.rollback()

    print("\nDatabase import failed.")
    print(error)


finally:

    if cursor is not None:
        cursor.close()

    if (
        connection is not None
        and connection.is_connected()
    ):
        connection.close()

    print("\nDatabase connection closed.")