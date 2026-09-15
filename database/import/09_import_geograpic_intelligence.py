# ============================================================
# PMIP — Import Geographic Intelligence Results
# File:
# database/import/09_import_geographic_intelligence.py
# ============================================================

from pathlib import Path
from datetime import datetime
import ast
import hashlib
import os
import sys
import unicodedata

import mysql.connector
from mysql.connector import Error, IntegrityError
import numpy as np
import pandas as pd
from dotenv import load_dotenv


# ============================================================
# 1. Configuration
# ============================================================

COMPONENT_NAME = "geographic_intelligence"
COMPONENT_VERSION = "1.0"

ARTIST_BATCH_SIZE = 250
TRACK_BATCH_SIZE = 500
COUNTRY_BATCH_SIZE = 100
MOVEMENT_BATCH_SIZE = 500


# ============================================================
# 2. Resolve PMIP repository root
# ============================================================

SCRIPT_PATH = Path(__file__).resolve()
REPO_ROOT = SCRIPT_PATH.parents[2]

load_dotenv(REPO_ROOT / ".env")


# ============================================================
# 3. Artifact paths
# ============================================================

GEOGRAPHIC_ROOT = (
    REPO_ROOT
    / "models"
    / "geographic_intelligence"
    / "results"
)

COUNTRY_FILE = (
    GEOGRAPHIC_ROOT
    / "country"
    / "country_findings.csv"
)

ARTIST_FILE = (
    GEOGRAPHIC_ROOT
    / "artist"
    / "artist_findings.csv"
)

TRACK_FILE = (
    GEOGRAPHIC_ROOT
    / "track"
    / "track_geographic_intelligence.csv"
)

TRACK_COUNTRY_ENTRY_FILE = (
    GEOGRAPHIC_ROOT
    / "track"
    / "track_country_entry.csv"
)

TRACK_MOMENTUM_FILE = (
    GEOGRAPHIC_ROOT
    / "track"
    / "track_cross_market_momentum.csv"
)


# ============================================================
# 4. Report paths
# ============================================================

REPORT_DIR = (
    REPO_ROOT
    / "database"
    / "import"
    / "reports"
)

REPORT_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

UNMATCHED_ARTIST_REPORT = (
    REPORT_DIR
    / "09_unmatched_geographic_artists.csv"
)

UNMATCHED_TRACK_REPORT = (
    REPORT_DIR
    / "09_unmatched_geographic_tracks.csv"
)

UNMATCHED_MOVEMENT_TRACK_REPORT = (
    REPORT_DIR
    / "09_unmatched_geographic_movement_tracks.csv"
)

UNMATCHED_MOVEMENT_COUNTRY_REPORT = (
    REPORT_DIR
    / "09_unmatched_geographic_movement_countries.csv"
)


# ============================================================
# 5. Utility functions
# ============================================================

def clean_text(value):
    """
    Convert a value to a clean Python string.
    Returns None for missing/empty values.
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

    if text.lower() in {
        "nan",
        "none",
        "null",
        "<na>",
    }:
        return None

    return text


def normalise_unicode(value):
    """
    Unicode-normalise text while preserving case.
    """

    text = clean_text(value)

    if text is None:
        return None

    return unicodedata.normalize(
        "NFKC",
        text,
    ).strip()


def normalise_lookup_text(value):
    """
    Normalised comparison representation.

    Used for matching only.
    It is NOT used as the unique geographic source identity.
    """

    text = normalise_unicode(value)

    if text is None:
        return None

    return " ".join(
        text.casefold().split()
    )


def sha256_text(value):
    """
    SHA-256 hash of a string.
    """

    if value is None:
        return None

    return hashlib.sha256(
        str(value).encode("utf-8")
    ).hexdigest()


def source_artist_identity_key(value):
    """
    Exact source-row identity.

    IMPORTANT:
    Case is preserved here.

    Therefore:
        ['AURORA']
    and
        ['Aurora']

    receive different identity keys.
    """

    text = normalise_unicode(value)

    if text is None:
        return None

    return sha256_text(text)


def source_artist_normalised_key(value):
    """
    Normalised artist source key.

    Used for matching/search support only.

    It is deliberately NOT used as the unique database identity.
    """

    text = normalise_lookup_text(value)

    if text is None:
        return None

    return sha256_text(text)


def parse_artist_list(value):
    """
    Parse artists_raw safely.

    Examples:
        "['AURORA']"
        "['ZAYN', 'PARTYNEXTDOOR']"

    Returns a Python list of artist names.
    """

    text = clean_text(value)

    if text is None:
        return []

    current = text

    # Some values can be encoded more than once.
    for _ in range(3):

        try:
            parsed = ast.literal_eval(current)
        except Exception:
            break

        if isinstance(parsed, list):

            result = []

            for item in parsed:

                item_text = clean_text(item)

                if item_text is not None:
                    result.append(item_text)

            return result

        if isinstance(parsed, tuple):

            result = []

            for item in parsed:

                item_text = clean_text(item)

                if item_text is not None:
                    result.append(item_text)

            return result

        if isinstance(parsed, str):
            current = parsed
            continue

        break

    # Fall back to treating the whole field as one artist label.
    return [text]


def safe_int(value):
    """
    Convert a numeric value to int or None.
    """

    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except Exception:
        pass

    try:
        number = float(value)

        if not np.isfinite(number):
            return None

        return int(round(number))

    except Exception:
        return None


def safe_float(value):
    """
    Convert a numeric value to float or None.
    """

    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except Exception:
        pass

    try:
        number = float(value)

        if not np.isfinite(number):
            return None

        return number

    except Exception:
        return None


def safe_bool(value):
    """
    Convert common boolean representations to 0/1.
    """

    if value is None:
        return 0

    try:
        if pd.isna(value):
            return 0
    except Exception:
        pass

    if isinstance(
        value,
        (bool, np.bool_),
    ):
        return int(value)

    if isinstance(
        value,
        (int, float, np.integer, np.floating),
    ):
        return int(
            float(value) != 0
        )

    text = str(value).strip().casefold()

    if text in {
        "true",
        "1",
        "yes",
        "y",
        "t",
    }:
        return 1

    return 0


def safe_date(value):
    """
    Convert source value into YYYY-MM-DD or None.
    """

    if value is None:
        return None

    try:
        if pd.isna(value):
            return None
    except Exception:
        pass

    parsed = pd.to_datetime(
        value,
        errors="coerce",
    )

    if pd.isna(parsed):
        return None

    return parsed.date()


def first_existing_column(
    dataframe,
    candidates,
):
    """
    Return the first matching column from a list.
    """

    for column in candidates:

        if column in dataframe.columns:
            return column

    return None


def execute_batches(
    cursor,
    connection,
    query,
    rows,
    batch_size,
    label,
):
    """
    Insert rows in safe batches.

    Each successful batch is committed separately so very large
    geographic files do not generate oversized MySQL packets.
    """

    total_rows = len(rows)

    if total_rows == 0:

        print(
            f"No rows prepared for {label}."
        )

        return 0

    number_of_batches = (
        total_rows + batch_size - 1
    ) // batch_size

    inserted_total = 0

    print()
    print(label)
    print("=" * 100)

    for batch_number, start in enumerate(
        range(
            0,
            total_rows,
            batch_size,
        ),
        start=1,
    ):

        batch = rows[
            start:
            start + batch_size
        ]

        cursor.executemany(
            query,
            batch,
        )

        connection.commit()

        inserted_total += len(batch)

        print(
            f"Batch "
            f"{batch_number:03d}/"
            f"{number_of_batches:03d}"
            f" | inserted={len(batch):,}"
            f" | total={inserted_total:,}"
        )

    return inserted_total


# ============================================================
# 6. Validate artifact files
# ============================================================

print()
print("PMIP Geographic Intelligence Import")
print("=" * 100)

required_files = [
    COUNTRY_FILE,
    ARTIST_FILE,
    TRACK_FILE,
    TRACK_COUNTRY_ENTRY_FILE,
]

missing_files = [
    path
    for path in required_files
    if not path.exists()
]

if missing_files:

    print()
    print("ERROR — Missing geographic intelligence files")
    print("=" * 100)

    for path in missing_files:
        print(path)

    sys.exit(1)


print()
print("Source artifacts")
print("=" * 100)

print(f"Country findings:       {COUNTRY_FILE}")
print(f"Artist findings:        {ARTIST_FILE}")
print(f"Track intelligence:     {TRACK_FILE}")
print(f"Track-country entries:  {TRACK_COUNTRY_ENTRY_FILE}")

if TRACK_MOMENTUM_FILE.exists():
    print(f"Track momentum:         {TRACK_MOMENTUM_FILE}")
else:
    print(
        "Track momentum:         not present "
        "(movement momentum will remain NULL)"
    )


# ============================================================
# 7. Load geographic source files
# ============================================================

country_df = pd.read_csv(
    COUNTRY_FILE,
    low_memory=False,
)

artist_df = pd.read_csv(
    ARTIST_FILE,
    low_memory=False,
)

track_df = pd.read_csv(
    TRACK_FILE,
    low_memory=False,
)

movement_df = pd.read_csv(
    TRACK_COUNTRY_ENTRY_FILE,
    low_memory=False,
)

if TRACK_MOMENTUM_FILE.exists():

    momentum_df = pd.read_csv(
        TRACK_MOMENTUM_FILE,
        low_memory=False,
    )

else:

    momentum_df = None


print()
print("Loaded geographic artifacts")
print("=" * 100)

print(
    f"Country findings:      "
    f"{len(country_df):,} rows"
)

print(
    f"Artist findings:       "
    f"{len(artist_df):,} rows"
)

print(
    f"Track intelligence:    "
    f"{len(track_df):,} rows"
)

print(
    f"Track-country entries: "
    f"{len(movement_df):,} rows"
)

if momentum_df is not None:
    print(
        f"Track momentum:        "
        f"{len(momentum_df):,} rows"
    )


# ============================================================
# 8. Validate mandatory source columns
# ============================================================

required_country_columns = {
    "country",
    "observations",
    "total_streams",
    "median_streams",
    "mean_streams",
    "median_chart_position",
    "top_10_rate_pct",
    "top_50_rate_pct",
    "number_one_rate_pct",
    "streaming_strength_percentile",
    "chart_strength_percentile",
    "market_context_percentile",
    "country_findings_index",
    "country_findings_class",
}

required_artist_columns = {
    "artists_raw",
    "geographic_profile_index",
    "artist_geographic_profile",
    "country_markets_reached",
    "international_reach_index",
    "international_reach_class",
    "market_penetration_index",
    "market_penetration_class",
    "stream_concentration_hhi",
    "effective_stream_markets",
    "market_dependency_class",
    "local_international_profile",
    "artist_diversification_index",
    "artist_findings_index",
    "artist_findings_class",
}

required_track_columns = {
    "track_id",
    "geographic_reach_score",
    "market_penetration_score",
    "geographic_concentration_score",
    "geographic_expansion_indicator",
    "geographic_intelligence_score",
    "geographic_balance_index",
    "strongest_geographic_dimension",
    "weakest_geographic_dimension",
    "geographic_intelligence_class",
    "geographic_performance_profile",
}

required_movement_columns = {
    "track_id",
    "country",
    "first_observed_date",
    "last_observed_date",
}


def validate_required_columns(
    dataframe,
    required_columns,
    label,
):

    missing = sorted(
        required_columns
        - set(dataframe.columns)
    )

    if missing:

        raise RuntimeError(
            f"{label} is missing required columns: "
            + ", ".join(missing)
        )


validate_required_columns(
    country_df,
    required_country_columns,
    "country_findings.csv",
)

validate_required_columns(
    artist_df,
    required_artist_columns,
    "artist_findings.csv",
)

validate_required_columns(
    track_df,
    required_track_columns,
    "track_geographic_intelligence.csv",
)

validate_required_columns(
    movement_df,
    required_movement_columns,
    "track_country_entry.csv",
)


# ============================================================
# 9. Validate exact geographic artist identities
# ============================================================

artist_df[
    "_source_artist_label"
] = artist_df[
    "artists_raw"
].apply(
    normalise_unicode
)

artist_df[
    "_source_artist_key"
] = artist_df[
    "artists_raw"
].apply(
    source_artist_normalised_key
)

artist_df[
    "_source_artist_identity_key"
] = artist_df[
    "artists_raw"
].apply(
    source_artist_identity_key
)


if (
    artist_df[
        "_source_artist_identity_key"
    ]
    .isna()
    .any()
):

    raise RuntimeError(
        "One or more artist geographic rows have "
        "an empty source identity."
    )


exact_duplicate_count = int(
    artist_df[
        "_source_artist_identity_key"
    ]
    .duplicated(
        keep=False
    )
    .sum()
)


print()
print("Artist source identity validation")
print("=" * 100)

print(
    f"Source artist rows: "
    f"{len(artist_df):,}"
)

print(
    "Unique raw source labels: "
    f"{artist_df['_source_artist_label'].nunique():,}"
)

print(
    "Unique exact source identities: "
    f"{artist_df['_source_artist_identity_key'].nunique():,}"
)

print(
    "Exact duplicate source identities: "
    f"{exact_duplicate_count:,}"
)


if exact_duplicate_count != 0:

    duplicate_examples = (
        artist_df.loc[
            artist_df[
                "_source_artist_identity_key"
            ].duplicated(
                keep=False
            ),
            [
                "artists_raw",
                "_source_artist_identity_key",
            ],
        ]
        .sort_values(
            "_source_artist_identity_key"
        )
    )

    print()
    print(
        duplicate_examples
        .head(100)
        .to_string(
            index=False
        )
    )

    raise RuntimeError(
        "Exact geographic artist identities are duplicated. "
        "The import has been stopped."
    )


# ============================================================
# 10. Connect to PMIP database
# ============================================================

connection = None
cursor = None
run_id = None


try:

    connection = mysql.connector.connect(
        host=os.getenv(
            "DB_HOST",
            "localhost",
        ),
        port=int(
            os.getenv(
                "DB_PORT",
                "3306",
            )
        ),
        database=os.getenv(
            "DB_NAME",
            "PMIP",
        ),
        user=os.getenv(
            "DB_USER",
        ),
        password=os.getenv(
            "DB_PASSWORD",
        ),
        autocommit=False,
    )

    if not connection.is_connected():
        raise RuntimeError(
            "Could not connect to the PMIP database."
        )

    cursor = connection.cursor()

    print()
    print("Database connection")
    print("=" * 100)

    print(
        "PMIP database connection successful."
    )


    # ========================================================
    # 11. Create intelligence run
    # ========================================================

    cursor.execute(
        """
        INSERT INTO intelligence_runs
        (
            component_name,
            component_version,
            generated_at
        )
        VALUES
        (
            %s,
            %s,
            %s
        )
        """,
        (
            COMPONENT_NAME,
            COMPONENT_VERSION,
            datetime.now(),
        ),
    )

    run_id = cursor.lastrowid

    connection.commit()


    print()
    print("Geographic intelligence run")
    print("=" * 100)

    print(
        f"run_id: {run_id}"
    )

    print(
        f"component: {COMPONENT_NAME}"
    )

    print(
        f"version: {COMPONENT_VERSION}"
    )


    # ========================================================
    # 12. Load PMIP country mappings
    # ========================================================

    cursor.execute(
        """
        SELECT
            country_id,
            country_name,
            country_code
        FROM countries
        """
    )

    country_rows_db = cursor.fetchall()

    country_mapping = {}
    ambiguous_country_keys = set()

    for (
        country_id,
        country_name,
        country_code,
    ) in country_rows_db:

        possible_keys = {
            normalise_lookup_text(
                country_name
            ),
            normalise_lookup_text(
                country_code
            ),
        }

        for key in possible_keys:

            if key is None:
                continue

            if (
                key in country_mapping
                and country_mapping[key] != country_id
            ):

                ambiguous_country_keys.add(
                    key
                )

            else:

                country_mapping[key] = (
                    country_id
                )

    for key in ambiguous_country_keys:
        country_mapping.pop(
            key,
            None,
        )


    print()
    print("Country identity mapping")
    print("=" * 100)

    print(
        f"Database countries loaded: "
        f"{len(country_rows_db):,}"
    )

    print(
        f"Country lookup keys: "
        f"{len(country_mapping):,}"
    )

    print(
        f"Ambiguous country keys: "
        f"{len(ambiguous_country_keys):,}"
    )


    # ========================================================
    # 13. Load PMIP track mappings
    # ========================================================

    cursor.execute(
        """
        SELECT
            track_id,
            source_track_id
        FROM tracks
        WHERE source_track_id IS NOT NULL
        """
    )

    track_rows_db = cursor.fetchall()

    track_mapping = {}
    ambiguous_track_keys = set()

    for (
        database_track_id,
        source_track_id,
    ) in track_rows_db:

        source_key = clean_text(
            source_track_id
        )

        if source_key is None:
            continue

        if (
            source_key in track_mapping
            and track_mapping[source_key]
            != database_track_id
        ):

            ambiguous_track_keys.add(
                source_key
            )

        else:

            track_mapping[source_key] = (
                database_track_id
            )

    for source_key in ambiguous_track_keys:

        track_mapping.pop(
            source_key,
            None,
        )


    print()
    print("Track identity mapping")
    print("=" * 100)

    print(
        f"Database track source IDs loaded: "
        f"{len(track_rows_db):,}"
    )

    print(
        f"Unique source-track mappings: "
        f"{len(track_mapping):,}"
    )

    print(
        f"Ambiguous source-track mappings: "
        f"{len(ambiguous_track_keys):,}"
    )


    # ========================================================
    # 14. Load PMIP artist mappings
    # ========================================================

    cursor.execute(
        """
        SELECT
            artist_id,
            artist_name
        FROM artists
        """
    )

    artist_rows_db = cursor.fetchall()

    artist_mapping = {}
    ambiguous_artist_keys = set()

    for (
        database_artist_id,
        database_artist_name,
    ) in artist_rows_db:

        key = normalise_lookup_text(
            database_artist_name
        )

        if key is None:
            continue

        if (
            key in artist_mapping
            and artist_mapping[key]
            != database_artist_id
        ):

            ambiguous_artist_keys.add(
                key
            )

        else:

            artist_mapping[key] = (
                database_artist_id
            )

    for key in ambiguous_artist_keys:

        artist_mapping.pop(
            key,
            None,
        )


    print()
    print("Artist identity mapping")
    print("=" * 100)

    print(
        f"Database artists loaded: "
        f"{len(artist_rows_db):,}"
    )

    print(
        f"Unique artist lookup keys: "
        f"{len(artist_mapping):,}"
    )

    print(
        f"Ambiguous artist lookup keys: "
        f"{len(ambiguous_artist_keys):,}"
    )


    # ========================================================
    # 15. Prepare country geographic intelligence
    # ========================================================

    country_insert_rows = []
    unmatched_countries = []

    for _, row in country_df.iterrows():

        source_country = clean_text(
            row["country"]
        )

        country_key = (
            normalise_lookup_text(
                source_country
            )
        )

        country_id = (
            country_mapping.get(
                country_key
            )
        )

        if country_id is None:

            unmatched_countries.append(
                source_country
            )

            continue

        country_insert_rows.append(
            (
                country_id,
                run_id,
                safe_int(
                    row["observations"]
                ),
                safe_int(
                    row["total_streams"]
                ),
                safe_float(
                    row["median_streams"]
                ),
                safe_float(
                    row["mean_streams"]
                ),
                safe_float(
                    row[
                        "median_chart_position"
                    ]
                ),
                safe_float(
                    row[
                        "top_10_rate_pct"
                    ]
                ),
                safe_float(
                    row[
                        "top_50_rate_pct"
                    ]
                ),
                safe_float(
                    row[
                        "number_one_rate_pct"
                    ]
                ),
                safe_float(
                    row[
                        "streaming_strength_percentile"
                    ]
                ),
                safe_float(
                    row[
                        "chart_strength_percentile"
                    ]
                ),
                safe_float(
                    row[
                        "market_context_percentile"
                    ]
                ),
                safe_float(
                    row[
                        "country_findings_index"
                    ]
                ),
                clean_text(
                    row[
                        "country_findings_class"
                    ]
                ),
            )
        )


    country_insert_query = """
        INSERT INTO country_geographic_intelligence
        (
            country_id,
            run_id,
            observations,
            total_streams,
            median_streams,
            mean_streams,
            median_chart_position,
            top_10_rate_pct,
            top_50_rate_pct,
            number_one_rate_pct,
            streaming_strength_percentile,
            chart_strength_percentile,
            market_context_percentile,
            country_findings_index,
            country_findings_class
        )
        VALUES
        (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s
        )
    """


    country_inserted = execute_batches(
        cursor,
        connection,
        country_insert_query,
        country_insert_rows,
        COUNTRY_BATCH_SIZE,
        "Importing country geographic intelligence",
    )


    print()
    print("Country geographic import summary")
    print("=" * 100)

    print(
        f"Source rows: "
        f"{len(country_df):,}"
    )

    print(
        f"Rows inserted: "
        f"{country_inserted:,}"
    )

    print(
        f"Unmatched countries: "
        f"{len(unmatched_countries):,}"
    )

    if unmatched_countries:

        print(
            "Unmatched country values: "
            + ", ".join(
                map(
                    str,
                    unmatched_countries,
                )
            )
        )


    # ========================================================
    # 16. Prepare artist geographic intelligence
    # ========================================================

    artist_insert_rows = []
    unmatched_artist_report_rows = []

    matched_artist_count = 0
    unmatched_artist_count = 0
    multi_artist_source_rows = 0

    for _, row in artist_df.iterrows():

        source_label = row[
            "_source_artist_label"
        ]

        source_key = row[
            "_source_artist_key"
        ]

        identity_key = row[
            "_source_artist_identity_key"
        ]

        parsed_artists = parse_artist_list(
            row["artists_raw"]
        )

        database_artist_id = None
        match_method = None

        # ----------------------------------------------------
        # Single artist source label
        # ----------------------------------------------------

        if len(parsed_artists) == 1:

            artist_lookup_key = (
                normalise_lookup_text(
                    parsed_artists[0]
                )
            )

            database_artist_id = (
                artist_mapping.get(
                    artist_lookup_key
                )
            )

            if database_artist_id is not None:
                match_method = (
                    "single_artist_exact_normalised"
                )

        # ----------------------------------------------------
        # Multi-artist geographic group
        # ----------------------------------------------------

        elif len(parsed_artists) > 1:

            multi_artist_source_rows += 1

            # First attempt an exact combined database label.
            joined_artist_label = ", ".join(
                parsed_artists
            )

            joined_key = (
                normalise_lookup_text(
                    joined_artist_label
                )
            )

            database_artist_id = (
                artist_mapping.get(
                    joined_key
                )
            )

            if database_artist_id is not None:
                match_method = (
                    "combined_artist_exact_normalised"
                )

        if database_artist_id is None:

            unmatched_artist_count += 1

            unmatched_artist_report_rows.append(
                {
                    "source_artist_label": (
                        source_label
                    ),
                    "source_artist_key": (
                        source_key
                    ),
                    "source_artist_identity_key": (
                        identity_key
                    ),
                    "parsed_artist_count": (
                        len(parsed_artists)
                    ),
                    "parsed_artists": (
                        repr(parsed_artists)
                    ),
                }
            )

        else:

            matched_artist_count += 1


        artist_insert_rows.append(
            (
                source_label,
                source_key,
                identity_key,
                database_artist_id,
                run_id,
                safe_int(
                    row[
                        "country_markets_reached"
                    ]
                ),
                safe_float(
                    row[
                        "international_reach_index"
                    ]
                ),
                clean_text(
                    row[
                        "international_reach_class"
                    ]
                ),
                safe_float(
                    row[
                        "market_penetration_index"
                    ]
                ),
                clean_text(
                    row[
                        "market_penetration_class"
                    ]
                ),
                safe_float(
                    row[
                        "stream_concentration_hhi"
                    ]
                ),
                safe_float(
                    row[
                        "effective_stream_markets"
                    ]
                ),
                clean_text(
                    row[
                        "market_dependency_class"
                    ]
                ),
                clean_text(
                    row[
                        "local_international_profile"
                    ]
                ),
                safe_float(
                    row[
                        "geographic_profile_index"
                    ]
                ),
                clean_text(
                    row[
                        "artist_geographic_profile"
                    ]
                ),
                safe_float(
                    row[
                        "artist_diversification_index"
                    ]
                ),
                safe_float(
                    row[
                        "artist_findings_index"
                    ]
                ),
                clean_text(
                    row[
                        "artist_findings_class"
                    ]
                ),
            )
        )


    artist_insert_query = """
        INSERT INTO artist_geographic_intelligence
        (
            source_artist_label,
            source_artist_key,
            source_artist_identity_key,
            artist_id,
            run_id,
            markets_reached,
            international_reach_index,
            international_reach_class,
            market_penetration_index,
            market_penetration_class,
            stream_concentration_hhi,
            effective_stream_markets,
            market_dependency_class,
            local_international_profile,
            geographic_profile_index,
            artist_geographic_profile,
            artist_diversification_index,
            artist_findings_index,
            artist_findings_class
        )
        VALUES
        (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s
        )
    """


    artist_inserted = execute_batches(
        cursor,
        connection,
        artist_insert_query,
        artist_insert_rows,
        ARTIST_BATCH_SIZE,
        "Importing artist geographic intelligence",
    )


    # Save unmatched artist audit report.
    pd.DataFrame(
        unmatched_artist_report_rows
    ).to_csv(
        UNMATCHED_ARTIST_REPORT,
        index=False,
    )


    print()
    print("Artist geographic import summary")
    print("=" * 100)

    print(
        f"Source rows: "
        f"{len(artist_df):,}"
    )

    print(
        f"Rows inserted: "
        f"{artist_inserted:,}"
    )

    print(
        f"Rows linked to a PMIP artist: "
        f"{matched_artist_count:,}"
    )

    print(
        f"Rows without direct PMIP artist match: "
        f"{unmatched_artist_count:,}"
    )

    print(
        f"Multi-artist source rows: "
        f"{multi_artist_source_rows:,}"
    )

    print(
        "IMPORTANT: unmatched artist rows were still "
        "preserved using their exact source identity."
    )

    print(
        f"Audit report: "
        f"{UNMATCHED_ARTIST_REPORT}"
    )


    # ========================================================
    # 17. Prepare track geographic intelligence
    # ========================================================

    track_insert_rows = []
    unmatched_track_report_rows = []

    matched_track_count = 0

    for _, row in track_df.iterrows():

        source_track_id = clean_text(
            row["track_id"]
        )

        database_track_id = (
            track_mapping.get(
                source_track_id
            )
        )

        if database_track_id is None:

            unmatched_track_report_rows.append(
                {
                    "source_track_id": (
                        source_track_id
                    ),
                    "track_name": (
                        clean_text(
                            row.get(
                                "track_name"
                            )
                        )
                    ),
                    "artists_raw": (
                        clean_text(
                            row.get(
                                "artists_raw"
                            )
                        )
                    ),
                }
            )

        else:

            matched_track_count += 1


        track_insert_rows.append(
            (
                source_track_id,
                database_track_id,
                run_id,
                safe_float(
                    row[
                        "geographic_reach_score"
                    ]
                ),
                safe_float(
                    row[
                        "market_penetration_score"
                    ]
                ),
                safe_float(
                    row[
                        "geographic_concentration_score"
                    ]
                ),
                safe_float(
                    row[
                        "geographic_expansion_indicator"
                    ]
                ),
                safe_float(
                    row[
                        "geographic_intelligence_score"
                    ]
                ),
                safe_float(
                    row[
                        "geographic_balance_index"
                    ]
                ),
                clean_text(
                    row[
                        "geographic_intelligence_class"
                    ]
                ),
                clean_text(
                    row[
                        "geographic_performance_profile"
                    ]
                ),
                clean_text(
                    row[
                        "strongest_geographic_dimension"
                    ]
                ),
                clean_text(
                    row[
                        "weakest_geographic_dimension"
                    ]
                ),
            )
        )


    track_insert_query = """
        INSERT INTO track_geographic_intelligence
        (
            source_track_id,
            track_id,
            run_id,
            geographic_reach_score,
            market_penetration_score,
            geographic_concentration_score,
            geographic_expansion_indicator,
            geographic_intelligence_score,
            geographic_balance_index,
            geographic_intelligence_class,
            geographic_performance_profile,
            strongest_geographic_dimension,
            weakest_geographic_dimension
        )
        VALUES
        (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s, %s, %s
        )
    """


    track_inserted = execute_batches(
        cursor,
        connection,
        track_insert_query,
        track_insert_rows,
        TRACK_BATCH_SIZE,
        "Importing track geographic intelligence",
    )


    pd.DataFrame(
        unmatched_track_report_rows
    ).to_csv(
        UNMATCHED_TRACK_REPORT,
        index=False,
    )


    print()
    print("Track geographic import summary")
    print("=" * 100)

    print(
        f"Source rows: "
        f"{len(track_df):,}"
    )

    print(
        f"Rows inserted: "
        f"{track_inserted:,}"
    )

    print(
        f"Rows linked to PMIP tracks: "
        f"{matched_track_count:,}"
    )

    print(
        "Rows without direct PMIP track match: "
        f"{len(unmatched_track_report_rows):,}"
    )

    print(
        "All source rows remain preserved through "
        "source_track_id."
    )

    print(
        f"Audit report: "
        f"{UNMATCHED_TRACK_REPORT}"
    )


    # ========================================================
    # 18. Build track-level momentum map
    # ========================================================

    track_momentum_mapping = {}

    if momentum_df is not None:

        momentum_track_column = (
            first_existing_column(
                momentum_df,
                [
                    "track_id",
                    "source_track_id",
                ],
            )
        )

        momentum_score_column = (
            first_existing_column(
                momentum_df,
                [
                    "cross_market_momentum_index",
                    "cross_market_momentum",
                ],
            )
        )

        if (
            momentum_track_column is not None
            and momentum_score_column is not None
        ):

            for _, row in momentum_df.iterrows():

                source_track_id = (
                    clean_text(
                        row[
                            momentum_track_column
                        ]
                    )
                )

                score = safe_float(
                    row[
                        momentum_score_column
                    ]
                )

                if source_track_id is not None:

                    track_momentum_mapping[
                        source_track_id
                    ] = score


    print()
    print("Track momentum mapping")
    print("=" * 100)

    print(
        f"Momentum values available: "
        f"{len(track_momentum_mapping):,}"
    )


    # ========================================================
    # 19. Determine movement flag columns
    # ========================================================

    initial_market_column = (
        first_existing_column(
            movement_df,
            [
                "is_initial_market",
            ],
        )
    )

    later_entry_column = (
        first_existing_column(
            movement_df,
            [
                "is_later_market_entry",
            ],
        )
    )

    validated_entry_column = (
        first_existing_column(
            movement_df,
            [
                "validated_new_market_entry",
                "market_entry_temporally_supported",
            ],
        )
    )


    # ========================================================
    # 20. Prepare track-market movements
    # ========================================================

    movement_insert_rows = []

    unmatched_movement_tracks = []
    unmatched_movement_countries = []

    matched_movement_track_count = 0
    matched_movement_country_count = 0

    for _, row in movement_df.iterrows():

        source_track_id = clean_text(
            row["track_id"]
        )

        source_country = clean_text(
            row["country"]
        )

        database_track_id = (
            track_mapping.get(
                source_track_id
            )
        )

        country_key = (
            normalise_lookup_text(
                source_country
            )
        )

        database_country_id = (
            country_mapping.get(
                country_key
            )
        )


        if database_track_id is None:

            unmatched_movement_tracks.append(
                {
                    "source_track_id": (
                        source_track_id
                    ),
                    "source_country": (
                        source_country
                    ),
                    "track_name": (
                        clean_text(
                            row.get(
                                "track_name_first"
                            )
                        )
                    ),
                }
            )

        else:

            matched_movement_track_count += 1


        if database_country_id is None:

            unmatched_movement_countries.append(
                {
                    "source_track_id": (
                        source_track_id
                    ),
                    "source_country": (
                        source_country
                    ),
                }
            )

        else:

            matched_movement_country_count += 1


        is_initial_market = (
            safe_bool(
                row[
                    initial_market_column
                ]
            )
            if initial_market_column
            else 0
        )

        is_later_market_entry = (
            safe_bool(
                row[
                    later_entry_column
                ]
            )
            if later_entry_column
            else 0
        )

        validated_new_entry = (
            safe_bool(
                row[
                    validated_entry_column
                ]
            )
            if validated_entry_column
            else is_later_market_entry
        )


        # Every source row represents an observed
        # track-country market presence.
        market_entry_flag = int(
            bool(
                is_initial_market
                or is_later_market_entry
                or validated_new_entry
            )
        )

        # Expansion is specifically a validated later-market entry.
        expansion_flag = int(
            bool(
                validated_new_entry
            )
        )

        # The saved geographic artifacts do not contain a
        # reliable country-level contraction flag.
        #
        # Therefore we DO NOT invent one.
        contraction_flag = 0

        cross_market_momentum = (
            track_momentum_mapping.get(
                source_track_id
            )
        )


        movement_insert_rows.append(
            (
                source_track_id,
                source_country,
                database_track_id,
                database_country_id,
                run_id,
                safe_date(
                    row[
                        "first_observed_date"
                    ]
                ),
                safe_date(
                    row[
                        "last_observed_date"
                    ]
                ),
                market_entry_flag,
                expansion_flag,
                contraction_flag,
                cross_market_momentum,
            )
        )


    movement_insert_query = """
        INSERT INTO track_market_movements
        (
            source_track_id,
            source_country,
            track_id,
            country_id,
            run_id,
            first_observation_date,
            latest_observation_date,
            market_entry_flag,
            expansion_flag,
            contraction_flag,
            cross_market_momentum
        )
        VALUES
        (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s,
            %s
        )
    """


    movement_inserted = execute_batches(
        cursor,
        connection,
        movement_insert_query,
        movement_insert_rows,
        MOVEMENT_BATCH_SIZE,
        "Importing track-market geographic movements",
    )


    pd.DataFrame(
        unmatched_movement_tracks
    ).drop_duplicates().to_csv(
        UNMATCHED_MOVEMENT_TRACK_REPORT,
        index=False,
    )

    pd.DataFrame(
        unmatched_movement_countries
    ).drop_duplicates().to_csv(
        UNMATCHED_MOVEMENT_COUNTRY_REPORT,
        index=False,
    )


    print()
    print("Track-market movement import summary")
    print("=" * 100)

    print(
        f"Source rows: "
        f"{len(movement_df):,}"
    )

    print(
        f"Rows inserted: "
        f"{movement_inserted:,}"
    )

    print(
        f"Rows with PMIP track match: "
        f"{matched_movement_track_count:,}"
    )

    print(
        f"Rows with PMIP country match: "
        f"{matched_movement_country_count:,}"
    )

    print(
        "Rows without PMIP track match: "
        f"{len(unmatched_movement_tracks):,}"
    )

    print(
        "Rows without PMIP country match: "
        f"{len(unmatched_movement_countries):,}"
    )


    # ========================================================
    # 21. Database validation
    # ========================================================

    print()
    print("Database validation")
    print("=" * 100)


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM country_geographic_intelligence
        WHERE run_id = %s
        """,
        (run_id,),
    )

    stored_country_rows = int(
        cursor.fetchone()[0]
    )


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM artist_geographic_intelligence
        WHERE run_id = %s
        """,
        (run_id,),
    )

    stored_artist_rows = int(
        cursor.fetchone()[0]
    )


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM track_geographic_intelligence
        WHERE run_id = %s
        """,
        (run_id,),
    )

    stored_track_rows = int(
        cursor.fetchone()[0]
    )


    cursor.execute(
        """
        SELECT COUNT(*)
        FROM track_market_movements
        WHERE run_id = %s
        """,
        (run_id,),
    )

    stored_movement_rows = int(
        cursor.fetchone()[0]
    )


    # Exact artist source identity duplicate check.
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM
        (
            SELECT
                source_artist_identity_key
            FROM artist_geographic_intelligence
            WHERE run_id = %s
            GROUP BY
                source_artist_identity_key
            HAVING COUNT(*) > 1
        ) duplicate_artist_sources
        """,
        (run_id,),
    )

    duplicate_artist_source_groups = int(
        cursor.fetchone()[0]
    )


    # Track source identity duplicate check.
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM
        (
            SELECT
                source_track_id
            FROM track_geographic_intelligence
            WHERE run_id = %s
            GROUP BY
                source_track_id
            HAVING COUNT(*) > 1
        ) duplicate_track_sources
        """,
        (run_id,),
    )

    duplicate_track_source_groups = int(
        cursor.fetchone()[0]
    )


    # Track-market identity duplicate check.
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM
        (
            SELECT
                source_track_id,
                source_country
            FROM track_market_movements
            WHERE run_id = %s
            GROUP BY
                source_track_id,
                source_country
            HAVING COUNT(*) > 1
        ) duplicate_market_sources
        """,
        (run_id,),
    )

    duplicate_market_source_groups = int(
        cursor.fetchone()[0]
    )


    # Orphan mapped artist IDs.
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM artist_geographic_intelligence agi
        LEFT JOIN artists a
            ON a.artist_id = agi.artist_id
        WHERE agi.run_id = %s
          AND agi.artist_id IS NOT NULL
          AND a.artist_id IS NULL
        """,
        (run_id,),
    )

    orphan_artist_ids = int(
        cursor.fetchone()[0]
    )


    # Orphan mapped track IDs.
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM track_geographic_intelligence tgi
        LEFT JOIN tracks t
            ON t.track_id = tgi.track_id
        WHERE tgi.run_id = %s
          AND tgi.track_id IS NOT NULL
          AND t.track_id IS NULL
        """,
        (run_id,),
    )

    orphan_track_ids = int(
        cursor.fetchone()[0]
    )


    print(
        f"Country rows stored: "
        f"{stored_country_rows:,}"
    )

    print(
        f"Artist rows stored: "
        f"{stored_artist_rows:,}"
    )

    print(
        f"Track rows stored: "
        f"{stored_track_rows:,}"
    )

    print(
        f"Track-market rows stored: "
        f"{stored_movement_rows:,}"
    )

    print(
        "Duplicate exact artist identities: "
        f"{duplicate_artist_source_groups:,}"
    )

    print(
        "Duplicate track source identities: "
        f"{duplicate_track_source_groups:,}"
    )

    print(
        "Duplicate track-country source identities: "
        f"{duplicate_market_source_groups:,}"
    )

    print(
        f"Orphan mapped artist IDs: "
        f"{orphan_artist_ids:,}"
    )

    print(
        f"Orphan mapped track IDs: "
        f"{orphan_track_ids:,}"
    )


    # ========================================================
    # 22. Final validation checklist
    # ========================================================

    country_count_ok = (
        stored_country_rows
        == len(country_insert_rows)
    )

    artist_count_ok = (
        stored_artist_rows
        == len(artist_df)
    )

    track_count_ok = (
        stored_track_rows
        == len(track_df)
    )

    movement_count_ok = (
        stored_movement_rows
        == len(movement_df)
    )

    artist_identity_ok = (
        duplicate_artist_source_groups
        == 0
    )

    track_identity_ok = (
        duplicate_track_source_groups
        == 0
    )

    movement_identity_ok = (
        duplicate_market_source_groups
        == 0
    )

    artist_fk_ok = (
        orphan_artist_ids
        == 0
    )

    track_fk_ok = (
        orphan_track_ids
        == 0
    )


    print()
    print("Final geographic intelligence checklist")
    print("=" * 100)

    print(
        "Country stored count matches prepared count: "
        f"{country_count_ok}"
    )

    print(
        "All artist geographic source rows preserved: "
        f"{artist_count_ok}"
    )

    print(
        "All track geographic source rows preserved: "
        f"{track_count_ok}"
    )

    print(
        "All track-country movement rows preserved: "
        f"{movement_count_ok}"
    )

    print(
        "No duplicate exact artist identities: "
        f"{artist_identity_ok}"
    )

    print(
        "No duplicate track source identities: "
        f"{track_identity_ok}"
    )

    print(
        "No duplicate track-country source identities: "
        f"{movement_identity_ok}"
    )

    print(
        "No orphan mapped artist IDs: "
        f"{artist_fk_ok}"
    )

    print(
        "No orphan mapped track IDs: "
        f"{track_fk_ok}"
    )


    all_checks_passed = all(
        [
            country_count_ok,
            artist_count_ok,
            track_count_ok,
            movement_count_ok,
            artist_identity_ok,
            track_identity_ok,
            movement_identity_ok,
            artist_fk_ok,
            track_fk_ok,
        ]
    )


    if not all_checks_passed:

        raise RuntimeError(
            "One or more geographic intelligence "
            "validation checks failed."
        )


    # ========================================================
    # 23. Final success summary
    # ========================================================

    print()
    print("Geographic intelligence import result")
    print("=" * 100)

    print(
        "Result: PMIP GEOGRAPHIC INTELLIGENCE "
        "IMPORTED SUCCESSFULLY"
    )

    print(
        f"Intelligence run: {run_id}"
    )

    print(
        f"Country geographic rows: "
        f"{stored_country_rows:,}"
    )

    print(
        f"Artist geographic rows: "
        f"{stored_artist_rows:,}"
    )

    print(
        f"Track geographic rows: "
        f"{stored_track_rows:,}"
    )

    print(
        f"Track-market movement rows: "
        f"{stored_movement_rows:,}"
    )

    print(
        "Exact geographic artist identities "
        "were preserved without case-collision merging."
    )

    print(
        "Geographic intelligence import is now complete."
    )


# ============================================================
# 24. Error handling
# ============================================================

except (
    Error,
    IntegrityError,
    RuntimeError,
    ValueError,
    KeyError,
) as exc:

    print()
    print("IMPORT ERROR")
    print("=" * 100)

    print(
        f"{type(exc).__name__}: {exc}"
    )

    if run_id is not None:

        print()
        print(
            "Attempted geographic intelligence run:"
        )

        print(
            f"run_id = {run_id}"
        )

        print()
        print(
            "Some batches may already have been committed. "
            "Inspect this run before retrying."
        )

    raise


# ============================================================
# 25. Close database resources
# ============================================================

finally:

    if cursor is not None:

        try:
            cursor.close()
        except Exception:
            pass

    if (
        connection is not None
        and connection.is_connected()
    ):

        connection.close()

        print()
        print(
            "Database connection closed."
        )