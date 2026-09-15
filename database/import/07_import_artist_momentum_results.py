# ============================================================
# PMIP — Import Artist Momentum Results
# ============================================================

from pathlib import Path
from collections import defaultdict
import os
import unicodedata

import pandas as pd
import mysql.connector
from dotenv import load_dotenv


print("PMIP artist-momentum database import")
print("=" * 80)


# ------------------------------------------------------------
# 1. Define project paths
# ------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MOMENTUM_RESULTS_PATH = (
    PROJECT_ROOT
    / "models"
    / "artist_momentum_scoring"
    / "results"
    / "pmip_artist_momentum_results.csv"
)

UNMATCHED_RESULTS_PATH = (
    PROJECT_ROOT
    / "database"
    / "import"
    / "unmatched_artist_momentum_results.csv"
)

DUPLICATE_RESULTS_PATH = (
    PROJECT_ROOT
    / "database"
    / "import"
    / "duplicate_artist_momentum_matches.csv"
)

ENV_PATH = (
    PROJECT_ROOT
    / ".env"
)


print("\nProject paths")
print("=" * 80)

print(
    f"Project root: "
    f"{PROJECT_ROOT}"
)

print(
    f"Momentum results: "
    f"{MOMENTUM_RESULTS_PATH}"
)

print(
    f".env file: "
    f"{ENV_PATH}"
)


# ------------------------------------------------------------
# 2. Validate required files
# ------------------------------------------------------------

if not MOMENTUM_RESULTS_PATH.exists():
    raise FileNotFoundError(
        "Artist momentum results file was not found:\n"
        f"{MOMENTUM_RESULTS_PATH}"
    )

if not ENV_PATH.exists():
    raise FileNotFoundError(
        ".env file was not found:\n"
        f"{ENV_PATH}"
    )


# ------------------------------------------------------------
# 3. Load environment variables
# ------------------------------------------------------------

load_dotenv(
    ENV_PATH
)

DB_HOST = os.getenv(
    "DB_HOST"
)

DB_PORT = int(
    os.getenv(
        "DB_PORT",
        "3306"
    )
)

DB_NAME = os.getenv(
    "DB_NAME"
)

DB_USER = os.getenv(
    "DB_USER"
)

DB_PASSWORD = os.getenv(
    "DB_PASSWORD"
)


required_database_settings = {
    "DB_HOST": DB_HOST,
    "DB_NAME": DB_NAME,
    "DB_USER": DB_USER,
    "DB_PASSWORD": DB_PASSWORD,
}


missing_database_settings = [
    setting
    for setting, value
    in required_database_settings.items()
    if not value
]


if missing_database_settings:
    raise ValueError(
        "Missing database settings in .env: "
        f"{missing_database_settings}"
    )


# ------------------------------------------------------------
# 4. Load momentum results
# ------------------------------------------------------------

momentum_df = pd.read_csv(
    MOMENTUM_RESULTS_PATH
)


print("\nArtist momentum source data")
print("=" * 80)

print(
    f"Rows loaded: "
    f"{len(momentum_df):,}"
)

print(
    f"Columns loaded: "
    f"{len(momentum_df.columns):,}"
)


required_columns = [
    "artist_name",
    "final_momentum_score",
    "momentum_category",
    "shared_score_rank",
    "displayed_position",
    "main_neutral_driver",
    "listener_daily_growth_component_0_100",
    "listener_peak_ratio_component_0_100",
    "final_growth_contribution",
    "final_peak_position_contribution",
]


missing_columns = [
    column
    for column in required_columns
    if column not in momentum_df.columns
]


if missing_columns:
    raise ValueError(
        "Artist momentum results are missing "
        "required columns: "
        f"{missing_columns}"
    )


print(
    "Required momentum columns available: True"
)


# ------------------------------------------------------------
# 5. Define Unicode-safe artist normalisation
# ------------------------------------------------------------

def artist_key(value):
    """
    Produce a Unicode-safe comparison key for artist names.
    """

    if pd.isna(value):
        return None

    text = str(value).strip()

    if not text:
        return None

    return (
        unicodedata
        .normalize(
            "NFKC",
            text
        )
        .casefold()
    )


momentum_df[
    "artist_match_key"
] = (
    momentum_df[
        "artist_name"
    ]
    .apply(
        artist_key
    )
)


missing_artist_name_count = (
    momentum_df[
        "artist_match_key"
    ]
    .isna()
    .sum()
)


print("\nArtist identity validation")
print("=" * 80)

print(
    f"Rows with artist name: "
    f"{momentum_df['artist_match_key'].notna().sum():,}"
)

print(
    f"Rows without artist name: "
    f"{missing_artist_name_count:,}"
)

print(
    f"Unique source artist names: "
    f"{momentum_df['artist_match_key'].nunique(dropna=True):,}"
)


# ------------------------------------------------------------
# 6. Connect to PMIP database
# ------------------------------------------------------------

connection = mysql.connector.connect(
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
)

cursor = connection.cursor(
    dictionary=True
)


print("\nDatabase connection")
print("=" * 80)

print(
    "PMIP database connection successful."
)


try:

    # --------------------------------------------------------
    # 7. Load database artist mappings
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT
            artist_id,
            artist_name
        FROM artists
        WHERE artist_name IS NOT NULL
          AND TRIM(artist_name) <> ''
        """
    )

    database_artist_rows = (
        cursor.fetchall()
    )


    artist_key_to_ids = defaultdict(
        list
    )


    for row in database_artist_rows:

        normalized_name = artist_key(
            row["artist_name"]
        )

        if normalized_name:

            artist_key_to_ids[
                normalized_name
            ].append(
                int(
                    row["artist_id"]
                )
            )


    unique_artist_key_to_id = {
        key: artist_ids[0]
        for key, artist_ids
        in artist_key_to_ids.items()
        if len(artist_ids) == 1
    }


    ambiguous_artist_keys = {
        key: artist_ids
        for key, artist_ids
        in artist_key_to_ids.items()
        if len(artist_ids) > 1
    }


    print("\nDatabase artist identity mapping")
    print("=" * 80)

    print(
        f"Database artists loaded: "
        f"{len(database_artist_rows):,}"
    )

    print(
        f"Unique artist-name mappings: "
        f"{len(unique_artist_key_to_id):,}"
    )

    print(
        f"Ambiguous artist-name mappings: "
        f"{len(ambiguous_artist_keys):,}"
    )


    # --------------------------------------------------------
    # 8. Match momentum rows to database artists
    # --------------------------------------------------------

    matched_records = []
    unmatched_records = []


    for _, row in momentum_df.iterrows():

        match_key = (
            row["artist_match_key"]
        )

        database_artist_id = None
        match_status = None


        if pd.isna(match_key):

            match_status = (
                "missing_artist_name"
            )


        elif (
            match_key
            in ambiguous_artist_keys
        ):

            match_status = (
                "ambiguous_database_artist_name"
            )


        elif (
            match_key
            not in unique_artist_key_to_id
        ):

            match_status = (
                "artist_not_found"
            )


        else:

            database_artist_id = (
                unique_artist_key_to_id[
                    match_key
                ]
            )

            match_status = (
                "matched"
            )


        record = row.to_dict()

        record[
            "database_artist_id"
        ] = database_artist_id

        record[
            "match_status"
        ] = match_status


        if match_status == "matched":

            matched_records.append(
                record
            )

        else:

            unmatched_records.append(
                record
            )


    matched_df = pd.DataFrame(
        matched_records
    )

    unmatched_df = pd.DataFrame(
        unmatched_records
    )


    print("\nMomentum-to-artist matching")
    print("=" * 80)

    print(
        f"Source rows: "
        f"{len(momentum_df):,}"
    )

    print(
        f"Matched rows: "
        f"{len(matched_df):,}"
    )

    print(
        f"Unmatched rows: "
        f"{len(unmatched_df):,}"
    )


    if len(momentum_df) > 0:

        matching_percentage = (
            len(matched_df)
            / len(momentum_df)
            * 100
        )

    else:

        matching_percentage = 0.0


    print(
        f"Matching coverage: "
        f"{matching_percentage:.2f}%"
    )


    # --------------------------------------------------------
    # 9. Save unmatched rows for diagnosis
    # --------------------------------------------------------

    if not unmatched_df.empty:

        unmatched_df.to_csv(
            UNMATCHED_RESULTS_PATH,
            index=False
        )


        print(
            "\nUnmatched artist momentum rows saved to:"
        )

        print(
            UNMATCHED_RESULTS_PATH
        )


        print(
            "\nUnmatched reason summary"
        )

        print(
            unmatched_df[
                "match_status"
            ]
            .value_counts()
        )


    # --------------------------------------------------------
    # 10. Prevent duplicate artist results
    # --------------------------------------------------------

    if not matched_df.empty:

        duplicated_artist_mask = (
            matched_df[
                "database_artist_id"
            ]
            .duplicated(
                keep=False
            )
        )

        duplicate_artist_rows = (
            matched_df[
                duplicated_artist_mask
            ]
        )

    else:

        duplicate_artist_rows = (
            pd.DataFrame()
        )


    print("\nMatched-result uniqueness")
    print("=" * 80)

    print(
        f"Duplicate matched artist rows: "
        f"{len(duplicate_artist_rows):,}"
    )


    if not duplicate_artist_rows.empty:

        duplicate_artist_rows.to_csv(
            DUPLICATE_RESULTS_PATH,
            index=False
        )

        raise ValueError(
            "Multiple momentum rows matched the same "
            "PMIP artist. Review:\n"
            f"{DUPLICATE_RESULTS_PATH}"
        )


    # --------------------------------------------------------
    # 11. Create intelligence run
    # --------------------------------------------------------

    cursor.execute(
        """
        INSERT INTO intelligence_runs (
            component_name,
            component_version,
            generated_at
        )
        VALUES (%s, %s, NOW())
        """,
        (
            "artist_momentum_scoring",
            "1.0",
        )
    )


    run_id = (
        cursor.lastrowid
    )


    print("\nArtist momentum intelligence run")
    print("=" * 80)

    print(
        f"Created run_id: "
        f"{run_id}"
    )


    # --------------------------------------------------------
    # 12. Helper conversion functions
    # --------------------------------------------------------

    def nullable_float(value):

        if pd.isna(value):
            return None

        return float(value)


    def nullable_integer(value):

        if pd.isna(value):
            return None

        return int(
            round(
                float(value)
            )
        )


    def nullable_text(value):

        if pd.isna(value):
            return None

        text = str(value).strip()

        return (
            text
            if text
            else None
        )


    # --------------------------------------------------------
    # 13. Prepare momentum rows
    # --------------------------------------------------------

    insert_rows = []


    for _, row in matched_df.iterrows():

        insert_rows.append(
            (
                int(
                    row[
                        "database_artist_id"
                    ]
                ),

                int(
                    run_id
                ),

                round(
                    float(
                        row[
                            "final_momentum_score"
                        ]
                    ),
                    2
                ),

                str(
                    row[
                        "momentum_category"
                    ]
                ).strip(),

                nullable_integer(
                    row[
                        "shared_score_rank"
                    ]
                ),

                nullable_integer(
                    row[
                        "displayed_position"
                    ]
                ),

                nullable_text(
                    row[
                        "main_neutral_driver"
                    ]
                ),

                (
                    round(
                        float(
                            row[
                                "listener_daily_growth_component_0_100"
                            ]
                        ),
                        4
                    )
                    if pd.notna(
                        row[
                            "listener_daily_growth_component_0_100"
                        ]
                    )
                    else None
                ),

                (
                    round(
                        float(
                            row[
                                "listener_peak_ratio_component_0_100"
                            ]
                        ),
                        4
                    )
                    if pd.notna(
                        row[
                            "listener_peak_ratio_component_0_100"
                        ]
                    )
                    else None
                ),

                (
                    round(
                        float(
                            row[
                                "final_growth_contribution"
                            ]
                        ),
                        4
                    )
                    if pd.notna(
                        row[
                            "final_growth_contribution"
                        ]
                    )
                    else None
                ),

                (
                    round(
                        float(
                            row[
                                "final_peak_position_contribution"
                            ]
                        ),
                        4
                    )
                    if pd.notna(
                        row[
                            "final_peak_position_contribution"
                        ]
                    )
                    else None
                ),
            )
        )


    print("\nMomentum rows prepared")
    print("=" * 80)

    print(
        f"Rows prepared for insertion: "
        f"{len(insert_rows):,}"
    )


    # --------------------------------------------------------
    # 14. Insert artist momentum results
    # --------------------------------------------------------

    insert_query = """
        INSERT INTO artist_momentum_results (
            artist_id,
            run_id,
            final_momentum_score,
            momentum_category,
            shared_score_rank,
            displayed_position,
            main_neutral_driver,
            relative_daily_growth_component,
            listener_peak_ratio_component,
            growth_contribution,
            peak_position_contribution
        )
        VALUES (
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s
        )
    """


    if insert_rows:

        cursor.executemany(
            insert_query,
            insert_rows
        )


    connection.commit()


    print("\nMomentum database insertion")
    print("=" * 80)

    print(
        f"Rows submitted: "
        f"{len(insert_rows):,}"
    )


    # --------------------------------------------------------
    # 15. Validate inserted rows
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM artist_momentum_results
        WHERE run_id = %s
        """,
        (
            run_id,
        )
    )

    inserted_count = (
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM artist_momentum_results amr
        LEFT JOIN artists a
            ON amr.artist_id = a.artist_id
        WHERE amr.run_id = %s
          AND a.artist_id IS NULL
        """,
        (
            run_id,
        )
    )

    orphan_artist_count = (
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM artist_momentum_results
        WHERE run_id = %s
          AND final_momentum_score IS NULL
        """,
        (
            run_id,
        )
    )

    missing_score_count = (
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM artist_momentum_results
        WHERE run_id = %s
          AND (
              final_momentum_score < 0
              OR final_momentum_score > 100
          )
        """,
        (
            run_id,
        )
    )

    out_of_range_score_count = (
        cursor.fetchone()[
            "row_count"
        ]
    )


    inserted_count_valid = (
        inserted_count
        == len(insert_rows)
    )


    print("\nArtist momentum import validation")
    print("=" * 80)

    print(
        f"Rows stored for run: "
        f"{inserted_count:,}"
    )

    print(
        f"Stored count matches prepared rows: "
        f"{inserted_count_valid}"
    )

    print(
        f"Orphan artist references: "
        f"{orphan_artist_count:,}"
    )

    print(
        f"Missing final momentum scores: "
        f"{missing_score_count:,}"
    )

    print(
        f"Scores outside 0-100: "
        f"{out_of_range_score_count:,}"
    )


    # --------------------------------------------------------
    # 16. Final validation
    # --------------------------------------------------------

    final_checks = {
        "At least one momentum row matched":
            len(matched_df) > 0,

        "No duplicate matched artists":
            len(duplicate_artist_rows) == 0,

        "Inserted count matches prepared rows":
            inserted_count_valid,

        "No orphan artist references":
            orphan_artist_count == 0,

        "No missing final momentum scores":
            missing_score_count == 0,

        "Momentum scores are within 0-100":
            out_of_range_score_count == 0,
    }


    print("\nFinal artist-momentum import checklist")
    print("=" * 80)

    for check, result in (
        final_checks.items()
    ):

        print(
            f"{check}: "
            f"{result}"
        )


    momentum_import_successful = all(
        final_checks.values()
    )


    print("\nArtist momentum import result")
    print("=" * 80)


    if momentum_import_successful:

        print(
            "Result: PMIP ARTIST MOMENTUM RESULTS "
            "IMPORTED SUCCESSFULLY"
        )

        print(
            f"Artist momentum intelligence run: "
            f"{run_id}"
        )

        print(
            f"Momentum results stored: "
            f"{inserted_count:,}"
        )

    else:

        print(
            "Result: PMIP ARTIST MOMENTUM RESULTS "
            "IMPORT REQUIRES REVIEW"
        )


except Exception:

    connection.rollback()

    print(
        "\nImport failed. Database changes "
        "have been rolled back."
    )

    raise


finally:

    cursor.close()
    connection.close()

    print(
        "\nDatabase connection closed."
    )