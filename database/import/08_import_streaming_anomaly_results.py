# ============================================================
# PMIP — Import Streaming Anomaly Intelligence
# ============================================================

from pathlib import Path
from collections import defaultdict
import os
import unicodedata

import pandas as pd
import mysql.connector
from dotenv import load_dotenv


print("PMIP streaming-anomaly database import")
print("=" * 90)


# ------------------------------------------------------------
# 1. Project paths
# ------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

RESULTS_DIRECTORY = (
    PROJECT_ROOT
    / "models"
    / "streaming_anomaly_detection"
    / "results"
)

FINAL_SCORES_PATH = (
    RESULTS_DIRECTORY
    / "final_anomaly_scores.csv"
)

DIRECTION_SEVERITY_PATH = (
    RESULTS_DIRECTORY
    / "anomaly_direction_severity.csv"
)

ARTIST_SUMMARIES_PATH = (
    RESULTS_DIRECTORY
    / "artist_level_explanations.csv"
)

UNMATCHED_OBSERVATIONS_PATH = (
    PROJECT_ROOT
    / "database"
    / "import"
    / "unmatched_streaming_anomaly_observations.csv"
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


print("\nProject paths")
print("=" * 90)

print(
    f"Project root: "
    f"{PROJECT_ROOT}"
)

print(
    f"Final anomaly scores: "
    f"{FINAL_SCORES_PATH}"
)

print(
    f"Direction/severity: "
    f"{DIRECTION_SEVERITY_PATH}"
)

print(
    f"Artist summaries: "
    f"{ARTIST_SUMMARIES_PATH}"
)


# ------------------------------------------------------------
# 2. Validate required files
# ------------------------------------------------------------

required_files = [
    FINAL_SCORES_PATH,
    DIRECTION_SEVERITY_PATH,
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


# ------------------------------------------------------------
# 3. Database configuration
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
# 4. Import configuration
# ------------------------------------------------------------

OBSERVATION_CHUNK_SIZE = 50_000

LOOKUP_BATCH_SIZE = 1_000

ANOMALY_INSERT_BATCH_SIZE = 1_000

ARTIST_INSERT_BATCH_SIZE = 250

MINIMUM_FIRST_CHUNK_COVERAGE = 95.0


# ------------------------------------------------------------
# 5. Helper functions
# ------------------------------------------------------------

def normalise_text(value):
    """
    Unicode-safe text normalisation.
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


def normalise_country(value):
    """
    Normalise source country values such as:
    eg, au, gb, us.
    """

    if pd.isna(value):
        return None

    text = (
        str(value)
        .strip()
        .lower()
    )

    return (
        text
        if text
        else None
    )


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


def boolean_to_integer(value):

    if pd.isna(value):
        return 0

    if isinstance(
        value,
        bool,
    ):
        return int(value)

    text = (
        str(value)
        .strip()
        .lower()
    )

    return int(
        text
        in {
            "true",
            "1",
            "yes",
            "y",
        }
    )


def batched(
    sequence,
    batch_size,
):
    """
    Yield fixed-size list batches.
    """

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
# 6. Validate saved result schemas
# ------------------------------------------------------------

final_score_columns = (
    pd.read_csv(
        FINAL_SCORES_PATH,
        nrows=0,
    )
    .columns
    .tolist()
)

direction_columns = (
    pd.read_csv(
        DIRECTION_SEVERITY_PATH,
        nrows=0,
    )
    .columns
    .tolist()
)

artist_summary_columns = (
    pd.read_csv(
        ARTIST_SUMMARIES_PATH,
        nrows=0,
    )
    .columns
    .tolist()
)


required_final_columns = [
    "source_index",
    "source_track_id",
    "source_country",
    "source_date",
    "source_streams",
    "source_chart_position",
    "pca_reconstruction_error",
    "anomaly_score_ratio",
    "anomaly_score_margin",
    "anomaly_score_excess_pct",
    "is_final_pca_anomaly",
    "model_partition",
]


required_direction_columns = [
    "source_index",
    "anomaly_direction",
    "anomaly_severity",
    "severity_rank",
]


missing_final_columns = [
    column
    for column in required_final_columns
    if column not in final_score_columns
]


missing_direction_columns = [
    column
    for column in required_direction_columns
    if column not in direction_columns
]


if missing_final_columns:
    raise ValueError(
        "final_anomaly_scores.csv is missing: "
        f"{missing_final_columns}"
    )


if missing_direction_columns:
    raise ValueError(
        "anomaly_direction_severity.csv is missing: "
        f"{missing_direction_columns}"
    )


print("\nSaved anomaly schema validation")
print("=" * 90)

print(
    f"Final-score columns: "
    f"{len(final_score_columns)}"
)

print(
    f"Direction/severity columns: "
    f"{len(direction_columns)}"
)

print(
    f"Artist-summary columns: "
    f"{len(artist_summary_columns)}"
)

print(
    "Required observation-level fields available: True"
)


# ------------------------------------------------------------
# 7. Connect to PMIP database
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


run_id = None


try:

    # --------------------------------------------------------
    # 8. Load country mappings
    # --------------------------------------------------------
    #
    # PMIP currently stores source country codes
    # such as 'eg', 'au', 'gb' in country_name.
    # country_code may be NULL.
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT
            country_id,
            country_name,
            country_code
        FROM countries
        """
    )


    country_rows = (
        cursor.fetchall()
    )


    country_key_to_ids = defaultdict(
        list
    )


    for row in country_rows:

        name_key = normalise_country(
            row[
                "country_name"
            ]
        )

        if name_key:

            country_key_to_ids[
                name_key
            ].append(
                int(
                    row[
                        "country_id"
                    ]
                )
            )


        code_key = normalise_country(
            row[
                "country_code"
            ]
        )

        if code_key:

            country_key_to_ids[
                code_key
            ].append(
                int(
                    row[
                        "country_id"
                    ]
                )
            )


    unique_country_to_id = {}

    ambiguous_country_keys = {}


    for key, ids in (
        country_key_to_ids.items()
    ):

        unique_ids = sorted(
            set(ids)
        )

        if len(unique_ids) == 1:

            unique_country_to_id[
                key
            ] = unique_ids[0]

        else:

            ambiguous_country_keys[
                key
            ] = unique_ids


    print("\nCountry identity mapping")
    print("=" * 90)

    print(
        f"Countries loaded: "
        f"{len(country_rows):,}"
    )

    print(
        f"Unique source-country mappings: "
        f"{len(unique_country_to_id):,}"
    )

    print(
        f"Ambiguous country mappings: "
        f"{len(ambiguous_country_keys):,}"
    )


    # --------------------------------------------------------
    # 9. Validate observation lookup index
    # --------------------------------------------------------

    cursor.execute(
        """
        SHOW INDEX
        FROM streaming_observations
        WHERE Key_name = 'idx_streaming_observation_lookup'
        """
    )


    lookup_index_rows = (
        cursor.fetchall()
    )


    print(
        "\nStreaming-observation lookup index"
    )
    print("=" * 90)

    print(
        "Lookup index available: "
        f"{len(lookup_index_rows) > 0}"
    )


    if not lookup_index_rows:

        print(
            "WARNING: idx_streaming_observation_lookup "
            "was not found."
        )

        print(
            "The importer can still run, but lookups "
            "may be slower."
        )


    # --------------------------------------------------------
    # 10. Validate anomaly-result database schema
    # --------------------------------------------------------

    cursor.execute(
        """
        SHOW COLUMNS
        FROM streaming_anomaly_results
        """
    )


    anomaly_table_columns = {
        row["Field"]
        for row
        in cursor.fetchall()
    }


    required_database_columns = {
        "source_index",
        "source_track_id",
        "observation_id",
        "run_id",
        "pca_reconstruction_error",
        "anomaly_score_ratio",
        "anomaly_score_margin",
        "anomaly_score_excess_pct",
        "is_final_pca_anomaly",
        "anomaly_direction",
        "anomaly_severity",
        "severity_rank",
        "model_partition",
    }


    missing_database_columns = (
        required_database_columns
        - anomaly_table_columns
    )


    if missing_database_columns:

        raise RuntimeError(
            "streaming_anomaly_results is missing "
            "required database columns: "
            f"{sorted(missing_database_columns)}"
        )


    print(
        "\nStreaming anomaly database schema"
    )
    print("=" * 90)

    print(
        "Required anomaly-result columns "
        "available: True"
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
            "streaming_anomaly_detection",
            "1.0",
        )
    )


    run_id = int(
        cursor.lastrowid
    )


    connection.commit()


    print(
        "\nStreaming anomaly intelligence run"
    )
    print("=" * 90)

    print(
        f"Created run_id: "
        f"{run_id}"
    )


    # --------------------------------------------------------
    # 12. Prepare unmatched-observation file
    # --------------------------------------------------------

    if (
        UNMATCHED_OBSERVATIONS_PATH.exists()
    ):

        UNMATCHED_OBSERVATIONS_PATH.unlink()


    unmatched_header_written = False


    # --------------------------------------------------------
    # 13. Chunked observation import
    # --------------------------------------------------------

    final_reader = pd.read_csv(
        FINAL_SCORES_PATH,
        chunksize=OBSERVATION_CHUNK_SIZE,
        low_memory=False,
    )


    direction_reader = pd.read_csv(
        DIRECTION_SEVERITY_PATH,
        chunksize=OBSERVATION_CHUNK_SIZE,
        low_memory=False,
    )


    total_source_rows = 0

    total_matched_rows = 0

    total_unmatched_rows = 0

    total_inserted_rows = 0

    total_ambiguous_rows = 0


    print(
        "\nImporting observation-level "
        "anomaly results"
    )
    print("=" * 90)


    for chunk_number, (
        final_chunk,
        direction_chunk,
    ) in enumerate(
        zip(
            final_reader,
            direction_reader,
        ),
        start=1,
    ):

        # ----------------------------------------------------
        # 13.1 Validate chunk alignment
        # ----------------------------------------------------

        if (
            len(final_chunk)
            != len(direction_chunk)
        ):

            raise ValueError(
                f"Chunk {chunk_number}: "
                "final-score and direction/severity "
                "row counts differ."
            )


        source_indexes_match = (
            final_chunk[
                "source_index"
            ]
            .reset_index(
                drop=True
            )
            .equals(
                direction_chunk[
                    "source_index"
                ]
                .reset_index(
                    drop=True
                )
            )
        )


        if not source_indexes_match:

            raise ValueError(
                f"Chunk {chunk_number}: "
                "source_index alignment failed."
            )


        final_chunk = (
            final_chunk
            .reset_index(
                drop=True
            )
            .copy()
        )


        direction_chunk = (
            direction_chunk
            .reset_index(
                drop=True
            )
            .copy()
        )


        # ----------------------------------------------------
        # 13.2 Normalise database identity
        # ----------------------------------------------------

        final_chunk[
            "database_country_id"
        ] = (
            final_chunk[
                "source_country"
            ]
            .apply(
                normalise_country
            )
            .map(
                unique_country_to_id
            )
        )


        final_chunk[
            "source_date_parsed"
        ] = pd.to_datetime(
            final_chunk[
                "source_date"
            ],
            errors="coerce",
        )


        final_chunk[
            "source_position_parsed"
        ] = pd.to_numeric(
            final_chunk[
                "source_chart_position"
            ],
            errors="coerce",
        )


        final_chunk[
            "source_streams_parsed"
        ] = pd.to_numeric(
            final_chunk[
                "source_streams"
            ],
            errors="coerce",
        )


        # ----------------------------------------------------
        # 13.3 Build historical-observation lookup keys
        # ----------------------------------------------------

        candidate_rows = (
            final_chunk[
                [
                    "database_country_id",
                    "source_date_parsed",
                    "source_position_parsed",
                    "source_streams_parsed",
                ]
            ]
            .dropna()
            .drop_duplicates()
            .copy()
        )


        lookup_keys = []


        for row in (
            candidate_rows.itertuples(
                index=False
            )
        ):

            lookup_keys.append(
                (
                    int(
                        row.database_country_id
                    ),

                    row.source_date_parsed.date(),

                    int(
                        row.source_position_parsed
                    ),

                    int(
                        row.source_streams_parsed
                    ),
                )
            )


        # ----------------------------------------------------
        # 13.4 Query corresponding observation IDs
        # ----------------------------------------------------

        observation_key_to_ids = defaultdict(
            list
        )


        for lookup_batch in batched(
            lookup_keys,
            LOOKUP_BATCH_SIZE,
        ):

            if not lookup_batch:
                continue


            placeholders = ",".join(
                ["(%s,%s,%s,%s)"]
                * len(
                    lookup_batch
                )
            )


            parameters = []


            for (
                country_id,
                observation_date,
                chart_position,
                streams,
            ) in lookup_batch:

                parameters.extend(
                    [
                        country_id,
                        observation_date,
                        chart_position,
                        streams,
                    ]
                )


            lookup_query = f"""
                SELECT
                    observation_id,
                    country_id,
                    observation_date,
                    chart_position,
                    streams
                FROM streaming_observations
                WHERE (
                    country_id,
                    observation_date,
                    chart_position,
                    streams
                ) IN (
                    {placeholders}
                )
            """


            cursor.execute(
                lookup_query,
                tuple(
                    parameters
                )
            )


            for database_row in (
                cursor.fetchall()
            ):

                key = (
                    int(
                        database_row[
                            "country_id"
                        ]
                    ),

                    database_row[
                        "observation_date"
                    ],

                    int(
                        database_row[
                            "chart_position"
                        ]
                    ),

                    int(
                        database_row[
                            "streams"
                        ]
                    ),
                )


                observation_key_to_ids[
                    key
                ].append(
                    int(
                        database_row[
                            "observation_id"
                        ]
                    )
                )


        # ----------------------------------------------------
        # 13.5 Prepare anomaly rows
        # ----------------------------------------------------

        anomaly_insert_rows = []

        unmatched_records = []


        for position in range(
            len(final_chunk)
        ):

            final_row = (
                final_chunk.iloc[
                    position
                ]
            )

            direction_row = (
                direction_chunk.iloc[
                    position
                ]
            )


            total_source_rows += 1


            source_index = (
                final_row[
                    "source_index"
                ]
            )

            source_track_id = (
                final_row.get(
                    "source_track_id"
                )
            )

            country_id = (
                final_row[
                    "database_country_id"
                ]
            )

            source_date = (
                final_row[
                    "source_date_parsed"
                ]
            )

            chart_position = (
                final_row[
                    "source_position_parsed"
                ]
            )

            source_streams = (
                final_row[
                    "source_streams_parsed"
                ]
            )


            match_status = None

            observation_id = None


            if pd.isna(
                source_index
            ):

                match_status = (
                    "missing_source_index"
                )


            elif pd.isna(
                country_id
            ):

                match_status = (
                    "country_not_found"
                )


            elif pd.isna(
                source_date
            ):

                match_status = (
                    "invalid_date"
                )


            elif pd.isna(
                chart_position
            ):

                match_status = (
                    "missing_chart_position"
                )


            elif pd.isna(
                source_streams
            ):

                match_status = (
                    "missing_streams"
                )


            else:

                lookup_key = (
                    int(
                        country_id
                    ),

                    source_date.date(),

                    int(
                        chart_position
                    ),

                    int(
                        source_streams
                    ),
                )


                matching_observation_ids = (
                    observation_key_to_ids.get(
                        lookup_key,
                        [],
                    )
                )


                if (
                    len(
                        matching_observation_ids
                    )
                    == 0
                ):

                    match_status = (
                        "observation_not_found"
                    )


                elif (
                    len(
                        matching_observation_ids
                    )
                    > 1
                ):

                    match_status = (
                        "ambiguous_observation"
                    )

                    total_ambiguous_rows += 1


                else:

                    observation_id = (
                        matching_observation_ids[
                            0
                        ]
                    )

                    match_status = (
                        "matched"
                    )


            if match_status != "matched":

                total_unmatched_rows += 1


                unmatched_records.append(
                    {
                        "source_index":
                            source_index,

                        "source_track_id":
                            source_track_id,

                        "source_track_name":
                            final_row.get(
                                "source_track_name"
                            ),

                        "source_country":
                            final_row.get(
                                "source_country"
                            ),

                        "source_date":
                            final_row.get(
                                "source_date"
                            ),

                        "source_streams":
                            final_row.get(
                                "source_streams"
                            ),

                        "source_chart_position":
                            final_row.get(
                                "source_chart_position"
                            ),

                        "match_status":
                            match_status,
                    }
                )


                continue


            total_matched_rows += 1


            # ------------------------------------------------
            # Source-level identity is preserved here.
            #
            # Multiple source_index values are allowed to
            # point to the same canonical observation_id.
            # ------------------------------------------------

            anomaly_insert_rows.append(
                (
                    nullable_integer(
                        source_index
                    ),

                    nullable_text(
                        source_track_id
                    ),

                    int(
                        observation_id
                    ),

                    int(
                        run_id
                    ),

                    nullable_float(
                        final_row[
                            "pca_reconstruction_error"
                        ]
                    ),

                    nullable_float(
                        final_row[
                            "anomaly_score_ratio"
                        ]
                    ),

                    nullable_float(
                        final_row[
                            "anomaly_score_margin"
                        ]
                    ),

                    nullable_float(
                        final_row[
                            "anomaly_score_excess_pct"
                        ]
                    ),

                    boolean_to_integer(
                        final_row[
                            "is_final_pca_anomaly"
                        ]
                    ),

                    nullable_text(
                        direction_row[
                            "anomaly_direction"
                        ]
                    ),

                    nullable_text(
                        direction_row[
                            "anomaly_severity"
                        ]
                    ),

                    nullable_integer(
                        direction_row[
                            "severity_rank"
                        ]
                    ),

                    nullable_text(
                        final_row[
                            "model_partition"
                        ]
                    ),
                )
            )


        # ----------------------------------------------------
        # 13.6 First-chunk safety gate
        # ----------------------------------------------------

        chunk_source_count = (
            len(
                final_chunk
            )
        )

        chunk_matched_count = (
            len(
                anomaly_insert_rows
            )
        )


        chunk_coverage = (
            chunk_matched_count
            / chunk_source_count
            * 100
            if chunk_source_count
            else 0.0
        )


        if (
            chunk_number == 1
            and
            chunk_coverage
            < MINIMUM_FIRST_CHUNK_COVERAGE
        ):

            raise RuntimeError(
                "First-chunk observation matching "
                "coverage is unexpectedly low: "
                f"{chunk_coverage:.2f}%. "
                "Import stopped before anomaly rows "
                "were committed."
            )


        # ----------------------------------------------------
        # 13.7 Insert anomaly rows in safe batches
        # ----------------------------------------------------

        anomaly_insert_query = """
            INSERT INTO streaming_anomaly_results (
                source_index,
                source_track_id,
                observation_id,
                run_id,
                pca_reconstruction_error,
                anomaly_score_ratio,
                anomaly_score_margin,
                anomaly_score_excess_pct,
                is_final_pca_anomaly,
                anomaly_direction,
                anomaly_severity,
                severity_rank,
                model_partition
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
                %s
            )
        """


        for insert_batch in batched(
            anomaly_insert_rows,
            ANOMALY_INSERT_BATCH_SIZE,
        ):

            cursor.executemany(
                anomaly_insert_query,
                insert_batch,
            )


        # ----------------------------------------------------
        # 13.8 Save unmatched diagnostics
        # ----------------------------------------------------

        if unmatched_records:

            unmatched_df = (
                pd.DataFrame(
                    unmatched_records
                )
            )


            unmatched_df.to_csv(
                UNMATCHED_OBSERVATIONS_PATH,
                mode="a",
                header=(
                    not unmatched_header_written
                ),
                index=False,
            )


            unmatched_header_written = True


        # ----------------------------------------------------
        # 13.9 Commit completed chunk
        # ----------------------------------------------------

        connection.commit()


        total_inserted_rows += (
            len(
                anomaly_insert_rows
            )
        )


        print(
            f"Chunk {chunk_number:03d} | "
            f"source={chunk_source_count:,} | "
            f"matched={chunk_matched_count:,} | "
            f"unmatched={len(unmatched_records):,} | "
            f"coverage={chunk_coverage:.2f}%"
        )


    # --------------------------------------------------------
    # 14. Observation-level import summary
    # --------------------------------------------------------

    observation_coverage = (
        total_matched_rows
        / total_source_rows
        * 100
        if total_source_rows
        else 0.0
    )


    print(
        "\nObservation-level import summary"
    )
    print("=" * 90)

    print(
        f"Source rows processed: "
        f"{total_source_rows:,}"
    )

    print(
        f"Matched observations: "
        f"{total_matched_rows:,}"
    )

    print(
        f"Unmatched observations: "
        f"{total_unmatched_rows:,}"
    )

    print(
        f"Ambiguous observations: "
        f"{total_ambiguous_rows:,}"
    )

    print(
        f"Rows inserted: "
        f"{total_inserted_rows:,}"
    )

    print(
        f"Observation matching coverage: "
        f"{observation_coverage:.4f}%"
    )


    # --------------------------------------------------------
    # 15. Load artist summaries
    # --------------------------------------------------------

    artist_df = pd.read_csv(
        ARTIST_SUMMARIES_PATH,
        low_memory=False,
    )


    print(
        "\nArtist anomaly-summary source"
    )
    print("=" * 90)

    print(
        f"Artist summary rows: "
        f"{len(artist_df):,}"
    )


    # --------------------------------------------------------
    # 16. Build database artist mapping
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


    for database_row in (
        database_artist_rows
    ):

        key = normalise_text(
            database_row[
                "artist_name"
            ]
        )

        if key:

            artist_key_to_ids[
                key
            ].append(
                int(
                    database_row[
                        "artist_id"
                    ]
                )
            )


    unique_artist_key_to_id = {}

    ambiguous_artist_keys = {}


    for key, ids in (
        artist_key_to_ids.items()
    ):

        unique_ids = sorted(
            set(ids)
        )

        if len(unique_ids) == 1:

            unique_artist_key_to_id[
                key
            ] = unique_ids[0]

        else:

            ambiguous_artist_keys[
                key
            ] = unique_ids


    print(
        "\nDatabase artist identity mapping"
    )
    print("=" * 90)

    print(
        f"Database artists loaded: "
        f"{len(database_artist_rows):,}"
    )

    print(
        f"Unique artist mappings: "
        f"{len(unique_artist_key_to_id):,}"
    )

    print(
        f"Ambiguous artist mappings: "
        f"{len(ambiguous_artist_keys):,}"
    )


    # --------------------------------------------------------
    # 17. Prepare artist summary rows
    # --------------------------------------------------------

    artist_insert_rows = []

    unmatched_artist_records = []


    for _, row in (
        artist_df.iterrows()
    ):

        artist_label = (
            row.get(
                "artist_label"
            )
        )


        artist_key = normalise_text(
            artist_label
        )


        if artist_key is None:

            unmatched_artist_records.append(
                {
                    "artist_label":
                        artist_label,

                    "match_status":
                        "missing_artist_label",
                }
            )

            continue


        if artist_key in (
            ambiguous_artist_keys
        ):

            unmatched_artist_records.append(
                {
                    "artist_label":
                        artist_label,

                    "match_status":
                        "ambiguous_artist_name",
                }
            )

            continue


        database_artist_id = (
            unique_artist_key_to_id.get(
                artist_key
            )
        )


        if database_artist_id is None:

            unmatched_artist_records.append(
                {
                    "artist_label":
                        artist_label,

                    "match_status":
                        "artist_not_found",
                }
            )

            continue


        latest_date = (
            pd.to_datetime(
                row.get(
                    "latest_observation_date"
                ),
                errors="coerce",
            )
        )


        artist_insert_rows.append(
            (
                int(
                    database_artist_id
                ),

                int(
                    run_id
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


    # --------------------------------------------------------
    # 18. Save unmatched artist diagnostics
    # --------------------------------------------------------

    if unmatched_artist_records:

        pd.DataFrame(
            unmatched_artist_records
        ).to_csv(
            UNMATCHED_ARTISTS_PATH,
            index=False,
        )

    elif (
        UNMATCHED_ARTISTS_PATH.exists()
    ):

        UNMATCHED_ARTISTS_PATH.unlink()


    # --------------------------------------------------------
    # 19. Insert artist summaries in safe batches
    # --------------------------------------------------------

    artist_insert_query = """
        INSERT INTO artist_anomaly_summaries (
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
            %s
        )
    """


    artist_rows_inserted = 0


    for insert_batch in batched(
        artist_insert_rows,
        ARTIST_INSERT_BATCH_SIZE,
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
        "\nArtist-summary import"
    )
    print("=" * 90)

    print(
        f"Source artist summaries: "
        f"{len(artist_df):,}"
    )

    print(
        f"Matched artist summaries: "
        f"{len(artist_insert_rows):,}"
    )

    print(
        f"Unmatched artist summaries: "
        f"{len(unmatched_artist_records):,}"
    )

    print(
        f"Artist summaries inserted: "
        f"{artist_rows_inserted:,}"
    )


    # --------------------------------------------------------
    # 20. Validate stored anomaly results
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM streaming_anomaly_results
        WHERE run_id = %s
        """,
        (
            run_id,
        )
    )


    stored_anomaly_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM streaming_anomaly_results sar
        LEFT JOIN streaming_observations so
            ON so.observation_id = sar.observation_id
        WHERE sar.run_id = %s
          AND so.observation_id IS NULL
        """,
        (
            run_id,
        )
    )


    orphan_observation_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM streaming_anomaly_results
        WHERE run_id = %s
          AND pca_reconstruction_error IS NULL
        """,
        (
            run_id,
        )
    )


    missing_pca_score_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM streaming_anomaly_results
        WHERE run_id = %s
          AND source_index IS NULL
        """,
        (
            run_id,
        )
    )


    missing_source_index_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM streaming_anomaly_results
        WHERE run_id = %s
          AND is_final_pca_anomaly = 1
        """,
        (
            run_id,
        )
    )


    stored_final_anomaly_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT
            COUNT(*) AS duplicated_source_groups
        FROM (
            SELECT
                source_index,
                COUNT(*) AS occurrences
            FROM streaming_anomaly_results
            WHERE run_id = %s
            GROUP BY source_index
            HAVING COUNT(*) > 1
        ) duplicates
        """,
        (
            run_id,
        )
    )


    duplicate_source_index_count = int(
        cursor.fetchone()[
            "duplicated_source_groups"
        ]
    )


    # --------------------------------------------------------
    # 21. Validate legitimate shared observations
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*) AS shared_observation_groups
        FROM (
            SELECT
                observation_id,
                COUNT(*) AS occurrences
            FROM streaming_anomaly_results
            WHERE run_id = %s
            GROUP BY observation_id
            HAVING COUNT(*) > 1
        ) shared_observations
        """,
        (
            run_id,
        )
    )


    shared_observation_group_count = int(
        cursor.fetchone()[
            "shared_observation_groups"
        ]
    )


    # --------------------------------------------------------
    # 22. Validate artist summaries
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM artist_anomaly_summaries
        WHERE run_id = %s
        """,
        (
            run_id,
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
        FROM artist_anomaly_summaries aas
        LEFT JOIN artists a
            ON a.artist_id = aas.artist_id
        WHERE aas.run_id = %s
          AND a.artist_id IS NULL
        """,
        (
            run_id,
        )
    )


    orphan_artist_count = int(
        cursor.fetchone()[
            "row_count"
        ]
    )


    # --------------------------------------------------------
    # 23. Final checks
    # --------------------------------------------------------

    final_checks = {

        "Observation matching coverage is at least 95%":
            observation_coverage
            >= 95.0,

        "Stored anomaly count matches inserted count":
            stored_anomaly_count
            == total_inserted_rows,

        "No orphan observation references":
            orphan_observation_count
            == 0,

        "No missing source indexes":
            missing_source_index_count
            == 0,

        "No duplicate source indexes within run":
            duplicate_source_index_count
            == 0,

        "No missing PCA reconstruction scores":
            missing_pca_score_count
            == 0,

        "Final PCA anomalies were imported":
            stored_final_anomaly_count
            > 0,

        "At least one artist summary matched":
            len(
                artist_insert_rows
            )
            > 0,

        "Stored artist count matches inserted count":
            stored_artist_count
            == artist_rows_inserted,

        "No orphan artist references":
            orphan_artist_count
            == 0,
    }


    print(
        "\nStreaming anomaly import validation"
    )
    print("=" * 90)

    print(
        f"Anomaly rows stored: "
        f"{stored_anomaly_count:,}"
    )

    print(
        f"Final PCA anomalies stored: "
        f"{stored_final_anomaly_count:,}"
    )

    print(
        f"Orphan observations: "
        f"{orphan_observation_count:,}"
    )

    print(
        f"Missing source indexes: "
        f"{missing_source_index_count:,}"
    )

    print(
        f"Duplicate source-index groups: "
        f"{duplicate_source_index_count:,}"
    )

    print(
        f"Canonical observations shared by "
        f"multiple source records: "
        f"{shared_observation_group_count:,}"
    )

    print(
        f"Missing PCA scores: "
        f"{missing_pca_score_count:,}"
    )

    print(
        f"Artist summaries stored: "
        f"{stored_artist_count:,}"
    )

    print(
        f"Orphan artist summaries: "
        f"{orphan_artist_count:,}"
    )


    print(
        "\nFinal anomaly-import checklist"
    )
    print("=" * 90)


    for check, result in (
        final_checks.items()
    ):

        print(
            f"{check}: "
            f"{result}"
        )


    anomaly_import_successful = all(
        final_checks.values()
    )


    print(
        "\nStreaming anomaly import result"
    )
    print("=" * 90)


    if anomaly_import_successful:

        print(
            "Result: PMIP STREAMING ANOMALY "
            "RESULTS IMPORTED SUCCESSFULLY"
        )

        print(
            f"Streaming anomaly intelligence run: "
            f"{run_id}"
        )

        print(
            f"Observation-level results stored: "
            f"{stored_anomaly_count:,}"
        )

        print(
            f"Artist summaries stored: "
            f"{stored_artist_count:,}"
        )

        print(
            f"Shared canonical observation groups: "
            f"{shared_observation_group_count:,}"
        )


    else:

        print(
            "Result: PMIP STREAMING ANOMALY "
            "IMPORT REQUIRES REVIEW"
        )


# ------------------------------------------------------------
# 24. Error handling
# ------------------------------------------------------------

except Exception as error:

    print(
        "\nIMPORT ERROR"
    )
    print("=" * 90)

    print(
        f"{type(error).__name__}: "
        f"{error}"
    )

    print(
        "\nThe import stopped before being marked "
        "as successfully completed."
    )


    if run_id is not None:

        print(
            "\nAttempted intelligence run:"
        )

        print(
            f"run_id = "
            f"{run_id}"
        )

        print(
            "\nBecause observation chunks may already "
            "have been committed, inspect this run "
            "before retrying."
        )


    raise


# ------------------------------------------------------------
# 25. Close database connection
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


    print(
        "\nDatabase connection closed."
    )