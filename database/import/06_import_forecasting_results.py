# ============================================================
# PMIP — Import Forecasting Results
# ============================================================

from pathlib import Path
from collections import defaultdict

import pandas as pd
import mysql.connector
from dotenv import load_dotenv
import os


print("PMIP forecasting-results database import")
print("=" * 80)


# ------------------------------------------------------------
# 1. Define project paths
# ------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

FORECAST_RESULTS_PATH = (
    PROJECT_ROOT
    / "models"
    / "forecasting"
    / "results"
    / "forecasting_results.csv"
)

UNMATCHED_RESULTS_PATH = (
    PROJECT_ROOT
    / "database"
    / "import"
    / "unmatched_forecasting_results.csv"
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
    f"Forecast results: "
    f"{FORECAST_RESULTS_PATH}"
)

print(
    f".env file: "
    f"{ENV_PATH}"
)


# ------------------------------------------------------------
# 2. Validate required files
# ------------------------------------------------------------

if not FORECAST_RESULTS_PATH.exists():
    raise FileNotFoundError(
        "Forecasting results file was not found:\n"
        f"{FORECAST_RESULTS_PATH}"
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
# 4. Load forecasting results
# ------------------------------------------------------------

forecast_df = pd.read_csv(
    FORECAST_RESULTS_PATH
)


print("\nForecasting source data")
print("=" * 80)

print(
    f"Rows loaded: "
    f"{len(forecast_df):,}"
)

print(
    f"Columns loaded: "
    f"{len(forecast_df.columns):,}"
)


required_columns = [
    "source_row_index",
    "Track",
    "Artist",
    "ISRC",
    "actual_spotify_streams",
    "raw_predicted_spotify_streams",
    "predicted_spotify_streams",
    "prediction_error",
    "absolute_prediction_error",
    "prediction_was_clipped",
]


missing_columns = [
    column
    for column in required_columns
    if column not in forecast_df.columns
]


if missing_columns:
    raise ValueError(
        "Forecasting results are missing required columns: "
        f"{missing_columns}"
    )


print(
    "Required forecasting columns available: True"
)


# ------------------------------------------------------------
# 5. Clean ISRC values
# ------------------------------------------------------------

forecast_df["ISRC"] = (
    forecast_df["ISRC"]
    .astype("string")
    .str.strip()
    .str.upper()
)


forecast_df["ISRC"] = (
    forecast_df["ISRC"]
    .replace(
        {
            "": pd.NA,
            "NAN": pd.NA,
            "NONE": pd.NA,
            "<NA>": pd.NA,
        }
    )
)


missing_isrc_count = (
    forecast_df["ISRC"]
    .isna()
    .sum()
)


print("\nForecast identity validation")
print("=" * 80)

print(
    f"Rows with ISRC: "
    f"{forecast_df['ISRC'].notna().sum():,}"
)

print(
    f"Rows without ISRC: "
    f"{missing_isrc_count:,}"
)

print(
    f"Unique source ISRC values: "
    f"{forecast_df['ISRC'].nunique(dropna=True):,}"
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
    # 7. Load track ISRC → track_id mappings
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT
            track_id,
            isrc
        FROM tracks
        WHERE isrc IS NOT NULL
          AND TRIM(isrc) <> ''
        """
    )

    database_track_rows = (
        cursor.fetchall()
    )


    isrc_to_track_ids = defaultdict(
        list
    )


    for row in database_track_rows:

        normalized_isrc = (
            str(row["isrc"])
            .strip()
            .upper()
        )

        isrc_to_track_ids[
            normalized_isrc
        ].append(
            int(
                row["track_id"]
            )
        )


    unique_isrc_to_track_id = {
        isrc: track_ids[0]
        for isrc, track_ids
        in isrc_to_track_ids.items()
        if len(track_ids) == 1
    }


    ambiguous_database_isrcs = {
        isrc: track_ids
        for isrc, track_ids
        in isrc_to_track_ids.items()
        if len(track_ids) > 1
    }


    print("\nDatabase track identity mapping")
    print("=" * 80)

    print(
        f"Database tracks with ISRC: "
        f"{len(database_track_rows):,}"
    )

    print(
        f"Unique database ISRC mappings: "
        f"{len(unique_isrc_to_track_id):,}"
    )

    print(
        f"Ambiguous database ISRC values: "
        f"{len(ambiguous_database_isrcs):,}"
    )


    # --------------------------------------------------------
    # 8. Match forecasting rows to PMIP tracks
    # --------------------------------------------------------

    matched_records = []
    unmatched_records = []


    for _, row in forecast_df.iterrows():

        isrc = row["ISRC"]

        match_status = None
        track_id = None


        if pd.isna(isrc):

            match_status = (
                "missing_isrc"
            )


        elif (
            isrc
            in ambiguous_database_isrcs
        ):

            match_status = (
                "ambiguous_database_isrc"
            )


        elif (
            isrc
            not in unique_isrc_to_track_id
        ):

            match_status = (
                "isrc_not_found"
            )


        else:

            track_id = (
                unique_isrc_to_track_id[
                    isrc
                ]
            )

            match_status = (
                "matched"
            )


        record = (
            row.to_dict()
        )

        record["track_id"] = (
            track_id
        )

        record["match_status"] = (
            match_status
        )


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


    print("\nForecast-to-track matching")
    print("=" * 80)

    print(
        f"Source rows: "
        f"{len(forecast_df):,}"
    )

    print(
        f"Matched rows: "
        f"{len(matched_df):,}"
    )

    print(
        f"Unmatched rows: "
        f"{len(unmatched_df):,}"
    )


    if len(forecast_df) > 0:

        matching_percentage = (
            len(matched_df)
            / len(forecast_df)
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
            "\nUnmatched forecasting rows saved to:"
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
    # 10. Prevent duplicate track results within this import
    # --------------------------------------------------------

    if not matched_df.empty:

        duplicated_track_mask = (
            matched_df[
                "track_id"
            ]
            .duplicated(
                keep=False
            )
        )

        duplicate_track_rows = (
            matched_df[
                duplicated_track_mask
            ]
        )

    else:

        duplicate_track_rows = (
            pd.DataFrame()
        )


    print("\nMatched-result uniqueness")
    print("=" * 80)

    print(
        f"Duplicate matched track rows: "
        f"{len(duplicate_track_rows):,}"
    )


    if not duplicate_track_rows.empty:

        duplicate_output_path = (
            PROJECT_ROOT
            / "database"
            / "import"
            / "duplicate_forecasting_track_matches.csv"
        )

        duplicate_track_rows.to_csv(
            duplicate_output_path,
            index=False
        )

        raise ValueError(
            "Multiple forecasting rows matched the same "
            "PMIP track. Review:\n"
            f"{duplicate_output_path}"
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
            "artist_performance_forecasting",
            "1.0",
        )
    )


    run_id = (
        cursor.lastrowid
    )


    print("\nForecasting intelligence run")
    print("=" * 80)

    print(
        f"Created run_id: "
        f"{run_id}"
    )


    # --------------------------------------------------------
    # 12. Prepare forecast rows for insertion
    # --------------------------------------------------------

    def nullable_number(value):
        """
        Convert pandas missing values to None.
        """

        if pd.isna(value):
            return None

        return float(value)


    def nullable_integer(value):
        """
        Convert pandas missing values to None,
        otherwise return a whole integer.
        """

        if pd.isna(value):
            return None

        return int(
            round(
                float(value)
            )
        )


    def boolean_to_integer(value):
        """
        Convert common boolean representations
        into MySQL-compatible 0 or 1.
        """

        if pd.isna(value):
            return 0

        if isinstance(
            value,
            bool
        ):
            return int(value)

        normalized = (
            str(value)
            .strip()
            .lower()
        )

        return int(
            normalized
            in {
                "true",
                "1",
                "yes",
                "y",
            }
        )


    insert_rows = []


    for _, row in matched_df.iterrows():

        insert_rows.append(
            (
                int(
                    row["track_id"]
                ),

                int(
                    run_id
                ),

                round(
                    float(
                        row[
                            "predicted_spotify_streams"
                        ]
                    ),
                    2
                ),

                nullable_integer(
                    row[
                        "actual_spotify_streams"
                    ]
                ),

                (
                    round(
                        float(
                            row[
                                "raw_predicted_spotify_streams"
                            ]
                        ),
                        2
                    )
                    if pd.notna(
                        row[
                            "raw_predicted_spotify_streams"
                        ]
                    )
                    else None
                ),

                (
                    round(
                        float(
                            row[
                                "prediction_error"
                            ]
                        ),
                        2
                    )
                    if pd.notna(
                        row[
                            "prediction_error"
                        ]
                    )
                    else None
                ),

                (
                    round(
                        float(
                            row[
                                "absolute_prediction_error"
                            ]
                        ),
                        2
                    )
                    if pd.notna(
                        row[
                            "absolute_prediction_error"
                        ]
                    )
                    else None
                ),

                boolean_to_integer(
                    row[
                        "prediction_was_clipped"
                    ]
                ),
            )
        )


    print("\nForecast rows prepared")
    print("=" * 80)

    print(
        f"Rows prepared for insertion: "
        f"{len(insert_rows):,}"
    )


    # --------------------------------------------------------
    # 13. Insert forecast results
    # --------------------------------------------------------

    insert_query = """
        INSERT INTO forecast_results (
            track_id,
            run_id,
            predicted_spotify_streams,
            actual_spotify_streams,
            raw_predicted_spotify_streams,
            prediction_error,
            absolute_prediction_error,
            prediction_was_clipped
        )
        VALUES (
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


    print("\nForecast database insertion")
    print("=" * 80)

    print(
        f"Rows submitted: "
        f"{len(insert_rows):,}"
    )


    # --------------------------------------------------------
    # 14. Validate inserted rows
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM forecast_results
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
        FROM forecast_results fr
        LEFT JOIN tracks t
            ON fr.track_id = t.track_id
        WHERE fr.run_id = %s
          AND t.track_id IS NULL
        """,
        (
            run_id,
        )
    )

    orphan_track_count = (
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM forecast_results
        WHERE run_id = %s
          AND predicted_spotify_streams < 0
        """,
        (
            run_id,
        )
    )

    negative_prediction_count = (
        cursor.fetchone()[
            "row_count"
        ]
    )


    cursor.execute(
        """
        SELECT COUNT(*) AS row_count
        FROM forecast_results
        WHERE run_id = %s
          AND predicted_spotify_streams IS NULL
        """,
        (
            run_id,
        )
    )

    missing_prediction_count = (
        cursor.fetchone()[
            "row_count"
        ]
    )


    inserted_count_valid = (
        inserted_count
        == len(insert_rows)
    )


    print("\nForecast import validation")
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
        f"Orphan track references: "
        f"{orphan_track_count:,}"
    )

    print(
        f"Negative stored predictions: "
        f"{negative_prediction_count:,}"
    )

    print(
        f"Missing stored predictions: "
        f"{missing_prediction_count:,}"
    )


    # --------------------------------------------------------
    # 15. Final validation
    # --------------------------------------------------------

    final_checks = {
        "At least one forecast row matched":
            len(matched_df) > 0,

        "No duplicate matched tracks":
            len(duplicate_track_rows) == 0,

        "Inserted count matches prepared rows":
            inserted_count_valid,

        "No orphan track references":
            orphan_track_count == 0,

        "No negative stored predictions":
            negative_prediction_count == 0,

        "No missing stored predictions":
            missing_prediction_count == 0,
    }


    print("\nFinal forecasting-import checklist")
    print("=" * 80)

    for check, result in (
        final_checks.items()
    ):

        print(
            f"{check}: "
            f"{result}"
        )


    forecasting_import_successful = all(
        final_checks.values()
    )


    print("\nForecasting import result")
    print("=" * 80)


    if forecasting_import_successful:

        print(
            "Result: PMIP FORECASTING RESULTS "
            "IMPORTED SUCCESSFULLY"
        )

        print(
            f"Forecasting intelligence run: "
            f"{run_id}"
        )

        print(
            f"Forecast results stored: "
            f"{inserted_count:,}"
        )

    else:

        print(
            "Result: PMIP FORECASTING RESULTS "
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