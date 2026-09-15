# ============================================================
# PMIP — Resume Streaming Anomaly Artist-Summary Import
# ============================================================

from pathlib import Path
from collections import defaultdict
import os
import unicodedata

import pandas as pd
import mysql.connector
from dotenv import load_dotenv


print("PMIP streaming-anomaly artist-summary recovery import")
print("=" * 90)


# ------------------------------------------------------------
# 1. Project paths
# ------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ARTIST_SUMMARIES_PATH = (
    PROJECT_ROOT
    / "models"
    / "streaming_anomaly_detection"
    / "results"
    / "artist_level_explanations.csv"
)

UNMATCHED_ARTISTS_PATH = (
    PROJECT_ROOT
    / "database"
    / "import"
    / "unmatched_artist_anomaly_summaries.csv"
)

ENV_PATH = (
    PROJECT_ROOT
    / ".env"
)


# ------------------------------------------------------------
# 2. Recovery configuration
# ------------------------------------------------------------

RUN_ID = 6

ARTIST_INSERT_BATCH_SIZE = 250

EXPECTED_ANOMALY_ROWS = 2_940_071

EXPECTED_ARTIST_SOURCE_ROWS = 18_804


# ------------------------------------------------------------
# 3. Validate required files
# ------------------------------------------------------------

required_files = [
    ARTIST_SUMMARIES_PATH,
    ENV_PATH,
]


missing_files = [
    path
    for path in required_files
    if not path.exists()
]


if missing_files:

    raise FileNotFoundError(
        "Required files are missing:\n"
        + "\n".join(
            str(path)
            for path in missing_files
        )
    )


print("\nRecovery source")
print("=" * 90)

print(
    f"Artist summaries: "
    f"{ARTIST_SUMMARIES_PATH}"
)

print(
    f"Existing anomaly intelligence run: "
    f"{RUN_ID}"
)


# ------------------------------------------------------------
# 4. Helper functions
# ------------------------------------------------------------

def normalise_text(value):
    """
    Unicode-safe case-insensitive key.

    Used only as a fallback for database artist matching.
    The original artist label is still preserved separately.
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


def clean_exact_text(value):
    """
    Preserve case while removing surrounding whitespace.
    """

    if pd.isna(value):
        return None

    text = (
        unicodedata
        .normalize(
            "NFKC",
            str(value).strip()
        )
    )

    return (
        text
        if text
        else None
    )


def nullable_integer(value):

    if pd.isna(value):
        return None

    return int(
        round(
            float(value)
        )
    )


def nullable_float(value):

    if pd.isna(value):
        return None

    return float(value)


def nullable_text(value):

    if pd.isna(value):
        return None

    text = str(value).strip()

    return (
        text
        if text
        else None
    )


def batched(
    sequence,
    batch_size,
):

    for start in range(
        0,
        len(sequence),
        batch_size,
    ):

        yield sequence[
            start:
            start + batch_size
        ]


# ------------------------------------------------------------
# 5. Load database configuration
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
        "3306",
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


required_settings = {
    "DB_HOST": DB_HOST,
    "DB_NAME": DB_NAME,
    "DB_USER": DB_USER,
    "DB_PASSWORD": DB_PASSWORD,
}


missing_settings = [
    key
    for key, value
    in required_settings.items()
    if not value
]


if missing_settings:

    raise ValueError(
        "Missing database settings in .env: "
        f"{missing_settings}"
    )


# ------------------------------------------------------------
# 6. Load artist anomaly-summary source
# ------------------------------------------------------------

artist_df = pd.read_csv(
    ARTIST_SUMMARIES_PATH,
    low_memory=False,
)


print("\nArtist anomaly-summary source")
print("=" * 90)

print(
    f"Source artist-summary rows: "
    f"{len(artist_df):,}"
)

print(
    f"Source columns: "
    f"{len(artist_df.columns):,}"
)


if len(artist_df) != EXPECTED_ARTIST_SOURCE_ROWS:

    raise RuntimeError(
        "Unexpected artist-summary source row count. "
        f"Expected {EXPECTED_ARTIST_SOURCE_ROWS:,}, "
        f"found {len(artist_df):,}."
    )


required_source_columns = [
    "artist_label",
    "total_observations",
    "final_pca_anomalies",
    "high_priority_anomalies",
    "extreme_anomalies",
    "positive_anomalies",
    "negative_anomalies",
    "flat_anomalies",
    "anomaly_rate_pct",
    "high_priority_share_pct",
    "maximum_pca_score",
    "maximum_anomaly_score_ratio",
    "artist_level_explanation",
    "artist_review_score",
    "latest_observation_date",
]


missing_source_columns = [
    column
    for column in required_source_columns
    if column not in artist_df.columns
]


if missing_source_columns:

    raise ValueError(
        "Artist summary source is missing columns: "
        f"{missing_source_columns}"
    )


# ------------------------------------------------------------
# 7. Validate source-label identity
# ------------------------------------------------------------

artist_df[
    "source_artist_label_clean"
] = (
    artist_df[
        "artist_label"
    ]
    .apply(
        clean_exact_text
    )
)


missing_source_labels = int(
    artist_df[
        "source_artist_label_clean"
    ]
    .isna()
    .sum()
)


duplicate_exact_labels = int(
    artist_df[
        "source_artist_label_clean"
    ]
    .duplicated()
    .sum()
)


print("\nSource artist-label validation")
print("=" * 90)

print(
    f"Missing source artist labels: "
    f"{missing_source_labels:,}"
)

print(
    f"Duplicate exact source labels: "
    f"{duplicate_exact_labels:,}"
)


if missing_source_labels > 0:

    raise RuntimeError(
        "Artist-summary source contains missing "
        "artist labels."
    )


if duplicate_exact_labels > 0:

    raise RuntimeError(
        "Artist-summary source contains duplicate "
        "exact artist labels."
    )


# ------------------------------------------------------------
# 8. Connect to PMIP database
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
print("=" * 90)

print(
    "PMIP database connection successful."
)


try:

    # --------------------------------------------------------
    # 9. Validate run 6 exists
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT
            run_id,
            component_name,
            component_version,
            generated_at
        FROM intelligence_runs
        WHERE run_id = %s
        """,
        (
            RUN_ID,
        )
    )


    run_record = (
        cursor.fetchone()
    )


    if run_record is None:

        raise RuntimeError(
            f"Intelligence run {RUN_ID} does not exist."
        )


    if (
        run_record[
            "component_name"
        ]
        != "streaming_anomaly_detection"
    ):

        raise RuntimeError(
            f"Run {RUN_ID} belongs to component "
            f"{run_record['component_name']!r}, not "
            "'streaming_anomaly_detection'."
        )


    print("\nExisting intelligence run")
    print("=" * 90)

    print(
        f"Run ID: "
        f"{run_record['run_id']}"
    )

    print(
        f"Component: "
        f"{run_record['component_name']}"
    )

    print(
        f"Version: "
        f"{run_record['component_version']}"
    )


    # --------------------------------------------------------
    # 10. Protect the successful observation import
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM streaming_anomaly_results
        WHERE run_id = %s
        """,
        (
            RUN_ID,
        )
    )


    existing_anomaly_rows = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    print("\nExisting observation-level intelligence")
    print("=" * 90)

    print(
        f"Stored anomaly rows for run {RUN_ID}: "
        f"{existing_anomaly_rows:,}"
    )


    if (
        existing_anomaly_rows
        != EXPECTED_ANOMALY_ROWS
    ):

        raise RuntimeError(
            "The existing observation-level import "
            "does not match the expected successful "
            "run state. "
            f"Expected {EXPECTED_ANOMALY_ROWS:,} rows, "
            f"found {existing_anomaly_rows:,}. "
            "Artist-summary recovery has been stopped."
        )


    print(
        "Observation-level anomaly results are "
        "protected and will not be modified."
    )


    # --------------------------------------------------------
    # 11. Validate artist-summary database schema
    # --------------------------------------------------------

    cursor.execute(
        """
        SHOW COLUMNS
        FROM artist_anomaly_summaries
        """
    )


    artist_table_columns = {
        row["Field"]
        for row
        in cursor.fetchall()
    }


    required_database_columns = {
        "source_artist_label",
        "artist_id",
        "run_id",
        "total_observations",
        "final_anomaly_count",
        "high_priority_anomaly_count",
        "extreme_anomaly_count",
        "positive_anomaly_count",
        "negative_anomaly_count",
        "flat_anomaly_count",
        "anomaly_rate_pct",
        "high_priority_share_pct",
        "maximum_pca_score",
        "maximum_anomaly_score_ratio",
        "artist_review_score",
        "artist_level_explanation",
        "latest_observation_date",
    }


    missing_database_columns = (
        required_database_columns
        - artist_table_columns
    )


    if missing_database_columns:

        raise RuntimeError(
            "artist_anomaly_summaries is missing "
            "required columns: "
            f"{sorted(missing_database_columns)}"
        )


    print("\nArtist-summary database schema")
    print("=" * 90)

    print(
        "Required artist-summary columns available: "
        "True"
    )


    # --------------------------------------------------------
    # 12. Remove only incomplete artist summaries for run 6
    # --------------------------------------------------------
    #
    # This does NOT touch streaming_anomaly_results.
    # --------------------------------------------------------

    cursor.execute(
        """
        DELETE FROM artist_anomaly_summaries
        WHERE run_id = %s
        """,
        (
            RUN_ID,
        )
    )


    removed_partial_artist_rows = (
        cursor.rowcount
    )


    connection.commit()


    print("\nArtist-summary recovery cleanup")
    print("=" * 90)

    print(
        f"Partial artist summaries removed: "
        f"{removed_partial_artist_rows:,}"
    )

    print(
        "Observation-level anomaly rows removed: 0"
    )


    # --------------------------------------------------------
    # 13. Load PMIP artists
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


    # --------------------------------------------------------
    # 14. Exact case-preserving artist mapping
    # --------------------------------------------------------

    exact_artist_to_ids = defaultdict(
        list
    )


    for database_row in (
        database_artist_rows
    ):

        exact_key = clean_exact_text(
            database_row[
                "artist_name"
            ]
        )

        if exact_key:

            exact_artist_to_ids[
                exact_key
            ].append(
                int(
                    database_row[
                        "artist_id"
                    ]
                )
            )


    unique_exact_artist_to_id = {}


    for key, ids in (
        exact_artist_to_ids.items()
    ):

        unique_ids = sorted(
            set(ids)
        )

        if len(unique_ids) == 1:

            unique_exact_artist_to_id[
                key
            ] = unique_ids[0]


    # --------------------------------------------------------
    # 15. Normalised fallback artist mapping
    # --------------------------------------------------------

    normalised_artist_to_ids = defaultdict(
        list
    )


    for database_row in (
        database_artist_rows
    ):

        normalised_key = normalise_text(
            database_row[
                "artist_name"
            ]
        )

        if normalised_key:

            normalised_artist_to_ids[
                normalised_key
            ].append(
                int(
                    database_row[
                        "artist_id"
                    ]
                )
            )


    unique_normalised_artist_to_id = {}

    ambiguous_normalised_artist_keys = {}


    for key, ids in (
        normalised_artist_to_ids.items()
    ):

        unique_ids = sorted(
            set(ids)
        )

        if len(unique_ids) == 1:

            unique_normalised_artist_to_id[
                key
            ] = unique_ids[0]

        else:

            ambiguous_normalised_artist_keys[
                key
            ] = unique_ids


    print("\nDatabase artist identity mapping")
    print("=" * 90)

    print(
        f"Database artists loaded: "
        f"{len(database_artist_rows):,}"
    )

    print(
        f"Unique exact artist mappings: "
        f"{len(unique_exact_artist_to_id):,}"
    )

    print(
        f"Unique normalised fallback mappings: "
        f"{len(unique_normalised_artist_to_id):,}"
    )

    print(
        f"Ambiguous normalised mappings: "
        f"{len(ambiguous_normalised_artist_keys):,}"
    )


    # --------------------------------------------------------
    # 16. Prepare artist summary inserts
    # --------------------------------------------------------

    artist_insert_rows = []

    unmatched_artist_records = []

    exact_matches = 0

    fallback_matches = 0


    for _, row in (
        artist_df.iterrows()
    ):

        source_artist_label = (
            clean_exact_text(
                row[
                    "artist_label"
                ]
            )
        )


        # ----------------------------------------------------
        # Prefer an exact case-preserving database match.
        # ----------------------------------------------------

        database_artist_id = (
            unique_exact_artist_to_id.get(
                source_artist_label
            )
        )


        match_method = None


        if database_artist_id is not None:

            match_method = (
                "exact_artist_name"
            )

            exact_matches += 1


        else:

            # ------------------------------------------------
            # Only use case-insensitive normalisation as a
            # fallback. The original source label remains
            # preserved in source_artist_label.
            # ------------------------------------------------

            normalised_key = (
                normalise_text(
                    source_artist_label
                )
            )


            if (
                normalised_key
                in ambiguous_normalised_artist_keys
            ):

                unmatched_artist_records.append(
                    {
                        "source_artist_label":
                            source_artist_label,

                        "match_status":
                            "ambiguous_normalised_artist",
                    }
                )

                continue


            database_artist_id = (
                unique_normalised_artist_to_id.get(
                    normalised_key
                )
            )


            if database_artist_id is None:

                unmatched_artist_records.append(
                    {
                        "source_artist_label":
                            source_artist_label,

                        "match_status":
                            "artist_not_found",
                    }
                )

                continue


            match_method = (
                "normalised_fallback"
            )

            fallback_matches += 1


        latest_date = pd.to_datetime(
            row.get(
                "latest_observation_date"
            ),
            errors="coerce",
        )


        artist_insert_rows.append(
            (
                source_artist_label,

                int(
                    database_artist_id
                ),

                int(
                    RUN_ID
                ),

                nullable_integer(
                    row.get(
                        "total_observations"
                    )
                ),

                nullable_integer(
                    row.get(
                        "final_pca_anomalies"
                    )
                ),

                nullable_integer(
                    row.get(
                        "high_priority_anomalies"
                    )
                ),

                nullable_integer(
                    row.get(
                        "extreme_anomalies"
                    )
                ),

                nullable_integer(
                    row.get(
                        "positive_anomalies"
                    )
                ),

                nullable_integer(
                    row.get(
                        "negative_anomalies"
                    )
                ),

                nullable_integer(
                    row.get(
                        "flat_anomalies"
                    )
                ),

                nullable_float(
                    row.get(
                        "anomaly_rate_pct"
                    )
                ),

                nullable_float(
                    row.get(
                        "high_priority_share_pct"
                    )
                ),

                nullable_float(
                    row.get(
                        "maximum_pca_score"
                    )
                ),

                nullable_float(
                    row.get(
                        "maximum_anomaly_score_ratio"
                    )
                ),

                nullable_float(
                    row.get(
                        "artist_review_score"
                    )
                ),

                nullable_text(
                    row.get(
                        "artist_level_explanation"
                    )
                ),

                (
                    latest_date.date()
                    if pd.notna(
                        latest_date
                    )
                    else None
                ),
            )
        )


    print("\nArtist-summary matching")
    print("=" * 90)

    print(
        f"Exact artist-name matches: "
        f"{exact_matches:,}"
    )

    print(
        f"Normalised fallback matches: "
        f"{fallback_matches:,}"
    )

    print(
        f"Matched artist summaries: "
        f"{len(artist_insert_rows):,}"
    )

    print(
        f"Unmatched artist summaries: "
        f"{len(unmatched_artist_records):,}"
    )


    # --------------------------------------------------------
    # 17. Save unmatched artist diagnostics
    # --------------------------------------------------------

    if unmatched_artist_records:

        pd.DataFrame(
            unmatched_artist_records
        ).to_csv(
            UNMATCHED_ARTISTS_PATH,
            index=False,
        )

        print(
            f"Unmatched artist diagnostics saved: "
            f"{UNMATCHED_ARTISTS_PATH}"
        )

    elif UNMATCHED_ARTISTS_PATH.exists():

        UNMATCHED_ARTISTS_PATH.unlink()


    # --------------------------------------------------------
    # 18. Validate unique source identities before insert
    # --------------------------------------------------------

    source_labels_to_insert = [
        row[0]
        for row in artist_insert_rows
    ]


    duplicated_source_labels = (
        len(source_labels_to_insert)
        - len(
            set(
                source_labels_to_insert
            )
        )
    )


    print("\nPrepared artist-summary identity validation")
    print("=" * 90)

    print(
        f"Prepared rows: "
        f"{len(artist_insert_rows):,}"
    )

    print(
        f"Duplicate exact source labels: "
        f"{duplicated_source_labels:,}"
    )


    if duplicated_source_labels > 0:

        raise RuntimeError(
            "Duplicate exact source artist labels "
            "remain in the prepared insert data."
        )


    # --------------------------------------------------------
    # 19. Insert artist summaries in safe batches
    # --------------------------------------------------------

    artist_insert_query = """
        INSERT INTO artist_anomaly_summaries (
            source_artist_label,
            artist_id,
            run_id,
            total_observations,
            final_anomaly_count,
            high_priority_anomaly_count,
            extreme_anomaly_count,
            positive_anomaly_count,
            negative_anomaly_count,
            flat_anomaly_count,
            anomaly_rate_pct,
            high_priority_share_pct,
            maximum_pca_score,
            maximum_anomaly_score_ratio,
            artist_review_score,
            artist_level_explanation,
            latest_observation_date
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
            %s,
            %s,
            %s,
            %s,
            %s,
            %s,
            %s
        )
    """


    artist_rows_inserted = 0


    print("\nArtist-summary database insertion")
    print("=" * 90)


    for batch_number, insert_batch in enumerate(
        batched(
            artist_insert_rows,
            ARTIST_INSERT_BATCH_SIZE,
        ),
        start=1,
    ):

        cursor.executemany(
            artist_insert_query,
            insert_batch,
        )


        connection.commit()


        artist_rows_inserted += (
            len(
                insert_batch
            )
        )


        print(
            f"Batch {batch_number:03d} | "
            f"inserted={len(insert_batch):,} | "
            f"total={artist_rows_inserted:,}"
        )


    # --------------------------------------------------------
    # 20. Validate stored artist summaries
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM artist_anomaly_summaries
        WHERE run_id = %s
        """,
        (
            RUN_ID,
        )
    )


    stored_artist_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM artist_anomaly_summaries
        WHERE run_id = %s
          AND source_artist_label IS NULL
        """,
        (
            RUN_ID,
        )
    )


    missing_source_label_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS duplicate_groups
        FROM (
            SELECT
                source_artist_label,
                COUNT(*) AS occurrences
            FROM artist_anomaly_summaries
            WHERE run_id = %s
            GROUP BY
                source_artist_label
            HAVING COUNT(*) > 1
        ) duplicates
        """,
        (
            RUN_ID,
        )
    )


    duplicate_source_label_groups = int(
        cursor.fetchone()[
            "duplicate_groups"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM artist_anomaly_summaries aas
        LEFT JOIN artists a
            ON a.artist_id = aas.artist_id
        WHERE aas.run_id = %s
          AND a.artist_id IS NULL
        """,
        (
            RUN_ID,
        )
    )


    orphan_artist_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    # --------------------------------------------------------
    # 21. Reconfirm observation-level rows unchanged
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM streaming_anomaly_results
        WHERE run_id = %s
        """,
        (
            RUN_ID,
        )
    )


    final_anomaly_row_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    # --------------------------------------------------------
    # 22. Final recovery validation
    # --------------------------------------------------------

    final_checks = {

        "Observation-level anomaly results remained unchanged":
            final_anomaly_row_count
            == EXPECTED_ANOMALY_ROWS,

        "Stored artist count matches inserted count":
            stored_artist_count
            == artist_rows_inserted,

        "No missing source artist labels":
            missing_source_label_count
            == 0,

        "No duplicate exact source labels":
            duplicate_source_label_groups
            == 0,

        "No orphan artist references":
            orphan_artist_count
            == 0,

        "At least one artist summary was stored":
            stored_artist_count
            > 0,
    }


    print("\nArtist-summary recovery validation")
    print("=" * 90)

    print(
        f"Observation-level anomaly rows: "
        f"{final_anomaly_row_count:,}"
    )

    print(
        f"Artist summaries stored: "
        f"{stored_artist_count:,}"
    )

    print(
        f"Missing source labels: "
        f"{missing_source_label_count:,}"
    )

    print(
        f"Duplicate source-label groups: "
        f"{duplicate_source_label_groups:,}"
    )

    print(
        f"Orphan artist references: "
        f"{orphan_artist_count:,}"
    )


    print("\nFinal recovery checklist")
    print("=" * 90)


    for check, result in (
        final_checks.items()
    ):

        print(
            f"{check}: "
            f"{result}"
        )


    recovery_successful = all(
        final_checks.values()
    )


    # --------------------------------------------------------
    # 23. Final result
    # --------------------------------------------------------

    print("\nArtist-summary recovery result")
    print("=" * 90)


    if recovery_successful:

        print(
            "Result: PMIP STREAMING ANOMALY "
            "ARTIST SUMMARIES IMPORTED SUCCESSFULLY"
        )

        print(
            f"Intelligence run: "
            f"{RUN_ID}"
        )

        print(
            f"Observation-level anomaly results retained: "
            f"{final_anomaly_row_count:,}"
        )

        print(
            f"Artist-level summaries stored: "
            f"{stored_artist_count:,}"
        )

        print(
            "Streaming anomaly intelligence import "
            "is now complete."
        )

    else:

        print(
            "Result: ARTIST-SUMMARY RECOVERY "
            "REQUIRES REVIEW"
        )


# ------------------------------------------------------------
# 24. Error handling
# ------------------------------------------------------------

except Exception as error:

    print("\nRECOVERY ERROR")
    print("=" * 90)

    print(
        f"{type(error).__name__}: "
        f"{error}"
    )

    print(
        "\nObservation-level anomaly data was not "
        "intentionally modified by this recovery script."
    )

    raise


# ------------------------------------------------------------
# 25. Close connection
# ------------------------------------------------------------

finally:

    try:

        cursor.close()

    except Exception:
        pass


    try:

        connection.close()

    except Exception:
        pass


    print("\nDatabase connection closed.")