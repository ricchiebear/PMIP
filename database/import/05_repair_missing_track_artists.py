from pathlib import Path
import ast
import os
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

DIAGNOSTIC_PATH = (
    PROJECT_ROOT
    / "database"
    / "import"
    / "missing_track_artist_diagnostics.csv"
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
# 3. Unicode-safe artist matching
# ============================================================

def artist_key(value):
    """
    Build a Unicode-safe lookup key without destroying
    Arabic, Chinese, Cyrillic, Japanese, Hebrew, Thai, etc.
    """

    if value is None:
        return ""

    text = str(value).strip()

    if not text:
        return ""

    text = unicodedata.normalize(
        "NFKC",
        text,
    )

    return text.casefold()


# ============================================================
# 4. Robust artist parser
# ============================================================

def parse_artists(value):
    """
    Decode artist values even when they have been stored
    more than once as strings.

    Examples:

    ['Artist']
        -> ['Artist']

    "['Artist']"
        -> ['Artist']

    "['Artist A', 'Artist B']"
        -> ['Artist A', 'Artist B']
    """

    if pd.isna(value):
        return []

    parsed = value


    # --------------------------------------------------------
    # Some values have been encoded more than once.
    # Attempt decoding repeatedly.
    # --------------------------------------------------------

    for _ in range(3):

        if not isinstance(
            parsed,
            str,
        ):
            break

        text = parsed.strip()

        if not text:
            return []

        try:
            decoded = ast.literal_eval(
                text
            )

        except (
            ValueError,
            SyntaxError,
        ):
            break

        # Stop if decoding no longer changes the value.
        if decoded == parsed:
            break

        parsed = decoded


    # --------------------------------------------------------
    # Convert final value into artist list
    # --------------------------------------------------------

    if isinstance(
        parsed,
        (
            list,
            tuple,
            set,
        ),
    ):

        artists = [
            str(artist).strip()
            for artist in parsed
            if str(artist).strip()
        ]

        return artists


    if isinstance(
        parsed,
        str,
    ):

        text = parsed.strip()

        if text:
            return [text]


    return []


# ============================================================
# 5. Validate diagnostic file
# ============================================================

if not DIAGNOSTIC_PATH.exists():

    raise FileNotFoundError(
        f"Diagnostic file not found: "
        f"{DIAGNOSTIC_PATH}"
    )


print()
print("PMIP Missing Track-Artist Repair")
print("=" * 75)

print(
    f"Diagnostic source: "
    f"{DIAGNOSTIC_PATH}"
)


# ============================================================
# 6. Load diagnostic data
# ============================================================

diagnostic_df = pd.read_csv(
    DIAGNOSTIC_PATH
)


required_columns = [
    "database_track_id",
    "source_track_id",
    "database_track_name",
    "artists",
]


missing_columns = [
    column
    for column in required_columns
    if column not in diagnostic_df.columns
]


if missing_columns:

    raise ValueError(
        f"Missing diagnostic columns: "
        f"{missing_columns}"
    )


print(
    f"Diagnostic rows loaded: "
    f"{len(diagnostic_df):,}"
)


# ============================================================
# 7. Connect to PMIP
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
    # 8. Recover existing artists
    # ========================================================

    print()
    print("Recovering existing artists...")
    print("=" * 75)


    cursor.execute(
        """
        SELECT
            artist_id,
            artist_name
        FROM artists
        """
    )


    artist_lookup = {}


    for (
        existing_artist_id,
        existing_artist_name,
    ) in cursor.fetchall():

        key = artist_key(
            existing_artist_name
        )

        if key:

            artist_lookup[
                key
            ] = existing_artist_id


    print(
        f"Existing artists recovered: "
        f"{len(artist_lookup):,}"
    )


    # ========================================================
    # 9. SQL statements
    # ========================================================

    insert_artist_sql = """
        INSERT INTO artists (
            artist_name
        )
        VALUES (%s)
    """


    insert_relationship_sql = """
        INSERT IGNORE INTO track_artists (
            track_id,
            artist_id
        )
        VALUES (%s, %s)
    """


    # ========================================================
    # 10. Repair missing relationships
    # ========================================================

    print()
    print(
        "Repairing missing track-artist relationships..."
    )
    print("=" * 75)


    repaired_track_ids = set()

    relationships_inserted = 0

    new_artists_created = 0

    unparseable_rows = 0

    empty_artist_values = 0


    for row in diagnostic_df.itertuples(
        index=False
    ):

        database_track_id = int(
            row.database_track_id
        )


        artist_names = parse_artists(
            row.artists
        )


        if not artist_names:

            unparseable_rows += 1

            continue


        for artist_name in artist_names:

            key = artist_key(
                artist_name
            )


            if not key:

                empty_artist_values += 1

                continue


            # ------------------------------------------------
            # Recover existing artist
            # ------------------------------------------------

            artist_id = (
                artist_lookup.get(
                    key
                )
            )


            # ------------------------------------------------
            # Create artist if necessary
            # ------------------------------------------------

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
                    key
                ] = artist_id

                new_artists_created += 1


            # ------------------------------------------------
            # Create relationship
            # ------------------------------------------------

            cursor.execute(
                insert_relationship_sql,
                (
                    database_track_id,
                    artist_id,
                ),
            )


            if cursor.rowcount > 0:

                relationships_inserted += 1


            repaired_track_ids.add(
                database_track_id
            )


    connection.commit()


    # ========================================================
    # 11. Validate database after repair
    # ========================================================

    print()
    print("Repair validation")
    print("=" * 75)


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM tracks t
        LEFT JOIN track_artists ta
            ON t.track_id = ta.track_id
        WHERE ta.track_id IS NULL
        """
    )

    remaining_tracks_without_artist = (
        cursor.fetchone()[0]
    )


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM tracks t
        LEFT JOIN track_artists ta
            ON t.track_id = ta.track_id
        WHERE ta.track_id IS NULL
          AND t.source_track_id IS NOT NULL
          AND t.isrc IS NULL
        """
    )

    remaining_chart_tracks_without_artist = (
        cursor.fetchone()[0]
    )


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
        FROM track_artists
        """
    )

    final_relationship_count = (
        cursor.fetchone()[0]
    )


    # ========================================================
    # 12. Final summary
    # ========================================================

    print(
        f"Diagnostic tracks processed: "
        f"{len(diagnostic_df):,}"
    )

    print(
        f"Tracks repaired: "
        f"{len(repaired_track_ids):,}"
    )

    print(
        f"New relationships inserted: "
        f"{relationships_inserted:,}"
    )

    print(
        f"New artists created: "
        f"{new_artists_created:,}"
    )

    print(
        f"Rows without parseable artists: "
        f"{unparseable_rows:,}"
    )

    print(
        f"Empty artist values skipped: "
        f"{empty_artist_values:,}"
    )


    print()

    print(
        f"Remaining tracks without artist: "
        f"{remaining_tracks_without_artist:,}"
    )

    print(
        f"Remaining chart tracks without artist: "
        f"{remaining_chart_tracks_without_artist:,}"
    )

    print(
        f"Final artists count: "
        f"{final_artist_count:,}"
    )

    print(
        f"Final track-artist relationships: "
        f"{final_relationship_count:,}"
    )


    # ========================================================
    # 13. Completion status
    # ========================================================

    if (
        remaining_tracks_without_artist == 0
        and
        remaining_chart_tracks_without_artist == 0
    ):

        print()
        print(
            "Task 5.6 completed successfully."
        )

        print(
            "All PMIP tracks now have at least "
            "one artist relationship."
        )


    else:

        print()
        print(
            "Some tracks still require review."
        )


except Error as error:

    if connection is not None:

        connection.rollback()


    print()
    print(
        "Track-artist repair failed."
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