from pathlib import Path
import ast
import os
import re
import unicodedata

import pandas as pd
import mysql.connector
from mysql.connector import Error
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
# 3. Import settings
# ============================================================

CHUNK_SIZE = 50_000
INSERT_BATCH_SIZE = 5_000


# ============================================================
# 4. Helper functions
# ============================================================

def normalise_text(value):
    """
    Convert text into a consistent matching form.
    """

    if pd.isna(value):
        return ""

    value = str(value).strip().lower()

    value = unicodedata.normalize(
        "NFKD",
        value,
    )

    value = "".join(
        character
        for character in value
        if not unicodedata.combining(character)
    )

    value = re.sub(
        r"[^a-z0-9]+",
        " ",
        value,
    )

    value = re.sub(
        r"\s+",
        " ",
        value,
    ).strip()

    return value


def parse_artists(value):
    """
    Convert the charts_cleaned artists field into a clean
    list of individual artist names.

    Examples:

    ['Jay Chou']
        -> ['Jay Chou']

    ['Kalido', 'Totoy El Frio']
        -> ['Kalido', 'Totoy El Frio']

    Plain text values are also supported.
    """

    if pd.isna(value):
        return []

    text = str(value).strip()

    if not text:
        return []

    # Try Python-list representation first.
    try:
        parsed = ast.literal_eval(text)

        if isinstance(parsed, list):
            return [
                str(artist).strip()
                for artist in parsed
                if str(artist).strip()
            ]

        if isinstance(parsed, str):
            return [
                parsed.strip()
            ]

    except (
        ValueError,
        SyntaxError,
    ):
        pass

    # Fallback for ordinary text.
    return [
        text
    ]


def build_artist_signature(artists):
    """
    Create an order-independent signature for an artist list.
    """

    cleaned = sorted(
        {
            normalise_text(artist)
            for artist in artists
            if normalise_text(artist)
        }
    )

    return "||".join(
        cleaned
    )


# ============================================================
# 5. Validate source file
# ============================================================

if not CHARTS_PATH.exists():
    raise FileNotFoundError(
        f"Historical chart dataset not found: {CHARTS_PATH}"
    )


print()
print("PMIP Streaming History Import")
print("=" * 75)

print(
    f"Source file: {CHARTS_PATH}"
)


# ============================================================
# 6. Connect to PMIP database
# ============================================================

connection = None
cursor = None

try:
    connection = mysql.connector.connect(
        **DB_CONFIG
    )

    cursor = connection.cursor()

    print()
    print(
        "PMIP database connection successful."
    )


    # ========================================================
    # 7. Recover artists already stored in PMIP
    # ========================================================

    print()
    print("Recovering PMIP artists...")
    print("=" * 75)

    cursor.execute(
        """
        SELECT
            artist_id,
            artist_name
        FROM artists
        """
    )

    artist_rows = cursor.fetchall()

    artist_lookup = {}

    for artist_id, artist_name in artist_rows:

        key = normalise_text(
            artist_name
        )

        if key:
            artist_lookup[
                key
            ] = artist_id

    print(
        f"Existing artists recovered: "
        f"{len(artist_lookup):,}"
    )


    # ========================================================
    # 8. Recover PMIP tracks and artist relationships
    # ========================================================

    print()
    print("Recovering PMIP tracks...")
    print("=" * 75)

    cursor.execute(
        """
        SELECT
            t.track_id,
            t.source_track_id,
            t.track_name,
            a.artist_name
        FROM tracks AS t
        LEFT JOIN track_artists AS ta
            ON t.track_id = ta.track_id
        LEFT JOIN artists AS a
            ON ta.artist_id = a.artist_id
        ORDER BY t.track_id
        """
    )

    existing_track_rows = (
        cursor.fetchall()
    )

    track_metadata = {}

    for (
        database_track_id,
        source_track_id,
        track_name,
        artist_name,
    ) in existing_track_rows:

        if database_track_id not in track_metadata:
            track_metadata[
                database_track_id
            ] = {
                "source_track_id":
                    source_track_id,
                "track_name":
                    track_name,
                "artists":
                    [],
            }

        if artist_name:
            track_metadata[
                database_track_id
            ][
                "artists"
            ].append(
                artist_name
            )


    # --------------------------------------------------------
    # Build multiple lookup strategies
    # --------------------------------------------------------

    exact_track_artist_lookup = {}

    track_name_lookup = {}

    existing_source_lookup = {}


    for (
        database_track_id,
        metadata,
    ) in track_metadata.items():

        track_name_key = (
            normalise_text(
                metadata[
                    "track_name"
                ]
            )
        )

        artist_signature = (
            build_artist_signature(
                metadata[
                    "artists"
                ]
            )
        )

        exact_key = (
            track_name_key
            + "###"
            + artist_signature
        )

        if (
            track_name_key
            and artist_signature
        ):
            exact_track_artist_lookup.setdefault(
                exact_key,
                [],
            ).append(
                database_track_id
            )

        if track_name_key:
            track_name_lookup.setdefault(
                track_name_key,
                [],
            ).append(
                database_track_id
            )

        source_track_id = metadata[
            "source_track_id"
        ]

        if source_track_id:
            existing_source_lookup[
                str(
                    source_track_id
                ).strip()
            ] = database_track_id


    print(
        f"Existing database tracks recovered: "
        f"{len(track_metadata):,}"
    )


    # ========================================================
    # 9. Recover countries
    # ========================================================

    print()
    print("Recovering PMIP countries...")
    print("=" * 75)

    cursor.execute(
        """
        SELECT
            country_id,
            country_name
        FROM countries
        """
    )

    country_lookup = {
        str(country_name).strip():
            country_id

        for (
            country_id,
            country_name,
        )
        in cursor.fetchall()
    }

    print(
        f"Existing countries recovered: "
        f"{len(country_lookup):,}"
    )


    # ========================================================
    # 10. SQL statements
    # ========================================================

    insert_artist_sql = """
        INSERT INTO artists (
            artist_name
        )
        VALUES (%s)
    """

    insert_track_sql = """
        INSERT INTO tracks (
            source_track_id,
            isrc,
            track_name
        )
        VALUES (%s, %s, %s)
    """

    insert_track_artist_sql = """
        INSERT IGNORE INTO track_artists (
            track_id,
            artist_id
        )
        VALUES (%s, %s)
    """

    insert_country_sql = """
        INSERT INTO countries (
            country_name,
            country_code
        )
        VALUES (%s, %s)
    """

    insert_observation_sql = """
        INSERT IGNORE INTO streaming_observations (
            track_id,
            country_id,
            observation_date,
            streams,
            chart_position
        )
        VALUES (%s, %s, %s, %s, %s)
    """


    # ========================================================
    # 11. Runtime counters
    # ========================================================

    total_source_rows = 0

    matched_existing_rows = 0

    rows_using_new_tracks = 0

    invalid_date_rows = 0

    observation_rows_prepared = 0

    new_artist_count = 0

    new_track_count = 0

    new_country_count = 0

    chunk_number = 0


    # --------------------------------------------------------
    # Cache chart-source track IDs once resolved.
    #
    # This is critical because the same chart track appears
    # repeatedly across dates and countries.
    # --------------------------------------------------------

    chart_track_lookup = {}


    # ========================================================
    # 12. Process charts_cleaned.csv in chunks
    # ========================================================

    print()
    print("Importing streaming history...")
    print("=" * 75)


    reader = pd.read_csv(
        CHARTS_PATH,
        usecols=[
            "date",
            "country",
            "position",
            "streams",
            "track_id",
            "artists",
            "name",
        ],
        chunksize=CHUNK_SIZE,
    )


    for chunk in reader:

        chunk_number += 1

        chunk_source_rows = len(
            chunk
        )

        total_source_rows += (
            chunk_source_rows
        )


        # ====================================================
        # 12.1 Resolve unique chart tracks in this chunk
        # ====================================================

        unique_tracks_df = (
            chunk[
                [
                    "track_id",
                    "name",
                    "artists",
                ]
            ]
            .drop_duplicates(
                subset=[
                    "track_id"
                ]
            )
        )


        for track_record in (
            unique_tracks_df.itertuples(
                index=False
            )
        ):

            chart_source_track_id = str(
                track_record.track_id
            ).strip()


            # -----------------------------------------------
            # Already resolved during an earlier chunk
            # -----------------------------------------------

            if (
                chart_source_track_id
                in chart_track_lookup
            ):
                continue


            track_name = (
                ""
                if pd.isna(
                    track_record.name
                )
                else str(
                    track_record.name
                ).strip()
            )

            artist_names = (
                parse_artists(
                    track_record.artists
                )
            )

            track_name_key = (
                normalise_text(
                    track_name
                )
            )

            artist_signature = (
                build_artist_signature(
                    artist_names
                )
            )

            exact_key = (
                track_name_key
                + "###"
                + artist_signature
            )


            database_track_id = None

            matched_existing = False


            # ===============================================
            # Strategy A:
            # Existing identical source ID
            # ===============================================

            if (
                chart_source_track_id
                in existing_source_lookup
            ):

                database_track_id = (
                    existing_source_lookup[
                        chart_source_track_id
                    ]
                )

                matched_existing = True


            # ===============================================
            # Strategy B:
            # Exact track-name + artist signature
            # ===============================================

            if (
                database_track_id is None
                and
                exact_key
                in exact_track_artist_lookup
            ):

                candidates = (
                    exact_track_artist_lookup[
                        exact_key
                    ]
                )

                if len(
                    candidates
                ) == 1:

                    database_track_id = (
                        candidates[0]
                    )

                    matched_existing = True


            # ===============================================
            # Strategy C:
            # Unique track name
            #
            # Only use the title by itself if that title maps
            # to exactly one PMIP database track.
            # ===============================================

            if (
                database_track_id is None
                and
                track_name_key
                in track_name_lookup
            ):

                candidates = (
                    list(
                        set(
                            track_name_lookup[
                                track_name_key
                            ]
                        )
                    )
                )

                if len(
                    candidates
                ) == 1:

                    database_track_id = (
                        candidates[0]
                    )

                    matched_existing = True


            # ===============================================
            # Strategy D:
            # Create a new chart-only PMIP track
            # ===============================================

            if database_track_id is None:

                cursor.execute(
                    insert_track_sql,
                    (
                        chart_source_track_id,
                        None,
                        track_name,
                    ),
                )

                database_track_id = (
                    cursor.lastrowid
                )

                new_track_count += 1


                # -------------------------------------------
                # Create missing artists and relationships
                # -------------------------------------------

                for artist_name in artist_names:

                    artist_key = (
                        normalise_text(
                            artist_name
                        )
                    )

                    if not artist_key:
                        continue


                    artist_id = (
                        artist_lookup.get(
                            artist_key
                        )
                    )


                    if artist_id is None:

                        cursor.execute(
                            insert_artist_sql,
                            (
                                artist_name,
                            ),
                        )

                        artist_id = (
                            cursor.lastrowid
                        )

                        artist_lookup[
                            artist_key
                        ] = artist_id

                        new_artist_count += 1


                    cursor.execute(
                        insert_track_artist_sql,
                        (
                            database_track_id,
                            artist_id,
                        ),
                    )


                # -------------------------------------------
                # Update in-memory matching structures
                # -------------------------------------------

                existing_source_lookup[
                    chart_source_track_id
                ] = database_track_id

                if track_name_key:

                    track_name_lookup.setdefault(
                        track_name_key,
                        [],
                    ).append(
                        database_track_id
                    )

                if (
                    track_name_key
                    and artist_signature
                ):

                    exact_track_artist_lookup.setdefault(
                        exact_key,
                        [],
                    ).append(
                        database_track_id
                    )


            # -----------------------------------------------
            # Cache resolved mapping
            # -----------------------------------------------

            chart_track_lookup[
                chart_source_track_id
            ] = database_track_id


            if matched_existing:
                matched_existing_rows += 1
            else:
                rows_using_new_tracks += 1


        connection.commit()


        # ====================================================
        # 12.2 Prepare dates
        # ====================================================

        chunk[
            "observation_date"
        ] = pd.to_datetime(
            chunk[
                "date"
            ],
            errors="coerce",
        ).dt.date


        valid_date_mask = (
            chunk[
                "observation_date"
            ]
            .notna()
        )

        invalid_date_rows += int(
            (
                ~valid_date_mask
            ).sum()
        )

        chunk = (
            chunk.loc[
                valid_date_mask
            ]
            .copy()
        )


        # ====================================================
        # 12.3 Prepare numeric values
        # ====================================================

        chunk[
            "streams"
        ] = pd.to_numeric(
            chunk[
                "streams"
            ],
            errors="coerce",
        )

        chunk[
            "position"
        ] = pd.to_numeric(
            chunk[
                "position"
            ],
            errors="coerce",
        )


        # ====================================================
        # 12.4 Create missing countries
        # ====================================================

        chunk_countries = (
            chunk[
                "country"
            ]
            .dropna()
            .astype(str)
            .str.strip()
            .loc[
                lambda values:
                    values.str.len() > 0
            ]
            .drop_duplicates()
            .tolist()
        )


        for country_name in chunk_countries:

            if (
                country_name
                in country_lookup
            ):
                continue

            cursor.execute(
                insert_country_sql,
                (
                    country_name,
                    None,
                ),
            )

            country_lookup[
                country_name
            ] = cursor.lastrowid

            new_country_count += 1


        connection.commit()


        # ====================================================
        # 12.5 Build observation records
        # ====================================================

        observation_records = []


        for row in (
            chunk.itertuples(
                index=False
            )
        ):

            chart_source_track_id = str(
                row.track_id
            ).strip()

            database_track_id = (
                chart_track_lookup.get(
                    chart_source_track_id
                )
            )

            if database_track_id is None:
                continue


            country_name = str(
                row.country
            ).strip()

            country_id = (
                country_lookup.get(
                    country_name
                )
            )

            if country_id is None:
                continue


            if pd.isna(
                row.streams
            ):
                streams = None
            else:
                streams = int(
                    row.streams
                )


            if pd.isna(
                row.position
            ):
                chart_position = None
            else:
                chart_position = int(
                    row.position
                )


            observation_records.append(
                (
                    int(
                        database_track_id
                    ),
                    int(
                        country_id
                    ),
                    row.observation_date,
                    streams,
                    chart_position,
                )
            )


        # ====================================================
        # 12.6 Insert observations in smaller batches
        # ====================================================

        for batch_start in range(
            0,
            len(
                observation_records
            ),
            INSERT_BATCH_SIZE,
        ):

            batch = (
                observation_records[
                    batch_start:
                    batch_start
                    + INSERT_BATCH_SIZE
                ]
            )

            cursor.executemany(
                insert_observation_sql,
                batch,
            )

            connection.commit()


        observation_rows_prepared += len(
            observation_records
        )


        # ====================================================
        # 12.7 Progress output
        # ====================================================

        print(
            f"Chunk {chunk_number:,}: "
            f"{chunk_source_rows:,} source rows | "
            f"{len(observation_records):,} observations prepared | "
            f"{len(chart_track_lookup):,} chart tracks resolved"
        )


    # ========================================================
    # 13. Final database validation
    # ========================================================

    print()
    print("Streaming-history import summary")
    print("=" * 75)


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM artists
        """
    )

    final_artist_count = (
        cursor.fetchone()[0]
    )


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM tracks
        """
    )

    final_track_count = (
        cursor.fetchone()[0]
    )


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM track_artists
        """
    )

    final_track_artist_count = (
        cursor.fetchone()[0]
    )


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM countries
        """
    )

    final_country_count = (
        cursor.fetchone()[0]
    )


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM streaming_observations
        """
    )

    final_observation_count = (
        cursor.fetchone()[0]
    )


    print(
        f"Source rows processed: "
        f"{total_source_rows:,}"
    )

    print(
        f"Unique chart tracks resolved: "
        f"{len(chart_track_lookup):,}"
    )

    print(
        f"New chart-only tracks created: "
        f"{new_track_count:,}"
    )

    print(
        f"New artists created: "
        f"{new_artist_count:,}"
    )

    print(
        f"New countries created: "
        f"{new_country_count:,}"
    )

    print(
        f"Rows with invalid dates: "
        f"{invalid_date_rows:,}"
    )

    print(
        f"Observation rows prepared: "
        f"{observation_rows_prepared:,}"
    )

    print()
    print("Final PMIP database counts")
    print("-" * 75)

    print(
        f"Artists: "
        f"{final_artist_count:,}"
    )

    print(
        f"Tracks: "
        f"{final_track_count:,}"
    )

    print(
        f"Track-artist relationships: "
        f"{final_track_artist_count:,}"
    )

    print(
        f"Countries: "
        f"{final_country_count:,}"
    )

    print(
        f"Streaming observations: "
        f"{final_observation_count:,}"
    )


    print()
    print(
        "PMIP streaming-history import completed successfully."
    )


except Error as error:

    if connection is not None:
        connection.rollback()

    print()
    print(
        "Streaming-history database import failed."
    )

    print(
        error
    )


finally:

    if cursor is not None:
        cursor.close()

    if (
        connection is not None
        and connection.is_connected()
    ):
        connection.close()

    print()
    print(
        "Database connection closed."
    )