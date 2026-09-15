from pathlib import Path
from dotenv import load_dotenv
import ast
import hashlib
import os
import unicodedata

import mysql.connector
import pandas as pd


# ============================================================
# 1. PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

COUNTRY_FILE = (
    PROJECT_ROOT
    / "models"
    / "market_growth_intelligence"
    / "results"
    / "country"
    / "country_growth_results.csv"
)

TRACK_MARKET_FILE = (
    PROJECT_ROOT
    / "models"
    / "market_growth_intelligence"
    / "results"
    / "track"
    / "track_market_growth_results.csv"
)

TRACK_FINAL_FILE = (
    PROJECT_ROOT
    / "models"
    / "market_growth_intelligence"
    / "results"
    / "track"
    / "track_priority_results.csv"
)

ARTIST_MARKET_FILE = (
    PROJECT_ROOT
    / "models"
    / "market_growth_intelligence"
    / "results"
    / "artist"
    / "artist_market_growth_results.csv"
)

ARTIST_FINAL_FILE = (
    PROJECT_ROOT
    / "models"
    / "market_growth_intelligence"
    / "results"
    / "artist"
    / "artist_priority_results.csv"
)

REPORT_DIR = PROJECT_ROOT / "database" / "import" / "reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

UNMATCHED_TRACK_MARKET_REPORT = (
    REPORT_DIR / "10_unmatched_track_market_growth.csv"
)

UNMATCHED_TRACK_FINAL_REPORT = (
    REPORT_DIR / "10_unmatched_track_growth_intelligence.csv"
)

UNMATCHED_ARTIST_MARKET_REPORT = (
    REPORT_DIR / "10_unmatched_artist_market_growth.csv"
)

UNMATCHED_ARTIST_FINAL_REPORT = (
    REPORT_DIR / "10_unmatched_artist_growth_intelligence.csv"
)


# ============================================================
# 2. IMPORT SETTINGS
# ============================================================

COMPONENT_NAME = "market_growth_intelligence"
COMPONENT_VERSION = "1.0"

# Small batches avoid max_allowed_packet problems.
BATCH_SIZE = 250


# ============================================================
# 3. LOAD ENVIRONMENT
# ============================================================

load_dotenv(PROJECT_ROOT / ".env")

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


# ============================================================
# 4. DISPLAY HELPERS
# ============================================================

def heading(title):
    print()
    print(title)
    print("=" * 100)


def require_file(path):
    if not path.exists():
        raise FileNotFoundError(
            f"Required source file was not found:\n{path}"
        )


# ============================================================
# 5. VALUE HELPERS
# ============================================================

def is_missing(value):
    try:
        return pd.isna(value)
    except Exception:
        return value is None


def text_or_none(value):
    if is_missing(value):
        return None

    text = str(value).strip()

    if not text or text.lower() in {"nan", "none", "null"}:
        return None

    return text


def int_or_none(value):
    if is_missing(value):
        return None

    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def float_or_none(value):
    if is_missing(value):
        return None

    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def bool_to_int(value):
    if is_missing(value):
        return 0

    if isinstance(value, bool):
        return int(value)

    text = str(value).strip().lower()

    return 1 if text in {
        "1",
        "true",
        "yes",
        "y",
        "t",
    } else 0


# ============================================================
# 6. SOURCE IDENTITY HELPERS
# ============================================================

def exact_source_artist_key(value):
    """
    Creates a stable SHA-256 key for the exact source artist label.

    IMPORTANT:
    This deliberately does NOT casefold the source label.

    Therefore:
        ['AURORA']
    and
        ['Aurora']

    remain separate source identities.

    This prevents the case-collision problem encountered during
    previous intelligence imports.
    """

    text = text_or_none(value)

    if text is None:
        return None

    # Unicode normalization only.
    # Case is deliberately preserved.
    text = unicodedata.normalize("NFKC", text)

    return hashlib.sha256(
        text.encode("utf-8")
    ).hexdigest()


def artist_name_key(value):
    """
    Used ONLY for linking an individual source artist to an
    existing PMIP artist.

    Unlike source_artist_key, this is case-insensitive because
    it is for database lookup, not source-row identity.
    """

    text = text_or_none(value)

    if text is None:
        return None

    return unicodedata.normalize(
        "NFKC",
        text
    ).casefold().strip()


def parse_artist_list(value):
    """
    Attempts to turn the source 'artists' field into a Python list.

    Examples:

        "['AURORA']"
            -> ['AURORA']

        '["Artist A", "Artist B"]'
            -> ['Artist A', 'Artist B']

    Multi-artist identities remain multi-artist identities.
    """

    text = text_or_none(value)

    if text is None:
        return []

    parsed = text

    # Some PMIP artefacts may contain nested/string-encoded lists.
    for _ in range(3):
        if not isinstance(parsed, str):
            break

        candidate = parsed.strip()

        try:
            parsed = ast.literal_eval(candidate)
        except (ValueError, SyntaxError):
            break

    if isinstance(parsed, (list, tuple, set)):
        result = []

        for item in parsed:
            item_text = text_or_none(item)

            if item_text is not None:
                result.append(item_text)

        return result

    if isinstance(parsed, str):
        return [parsed.strip()]

    return [str(parsed).strip()]


# ============================================================
# 7. SOURCE COLUMN VALIDATION
# ============================================================

def require_columns(df, required_columns, label):
    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            f"{label} is missing required columns:\n"
            f"{missing}\n\n"
            f"Available columns:\n"
            f"{df.columns.tolist()}"
        )


# ============================================================
# 8. DATABASE LOOKUP MAPS
# ============================================================

def load_country_maps(cursor):
    cursor.execute(
        """
        SELECT
            country_id,
            country_name,
            country_code
        FROM countries
        """
    )

    code_map = {}
    name_map = {}

    for country_id, country_name, country_code in cursor.fetchall():

        if country_code:
            code_map[
                str(country_code).strip().casefold()
            ] = country_id

        if country_name:
            name_map[
                str(country_name).strip().casefold()
            ] = country_id

    return code_map, name_map


def resolve_country_id(
    source_country,
    country_code_map,
    country_name_map
):
    text = text_or_none(source_country)

    if text is None:
        return None

    key = text.casefold()

    if key in country_code_map:
        return country_code_map[key]

    if key in country_name_map:
        return country_name_map[key]

    return None


def load_track_map(cursor):
    """
    PMIP growth files use the source/chart track identifier.

    The database stores that identifier in tracks.source_track_id.
    """

    cursor.execute(
        """
        SELECT
            track_id,
            source_track_id
        FROM tracks
        WHERE source_track_id IS NOT NULL
        """
    )

    mapping = {}

    ambiguous = set()

    for track_id, source_track_id in cursor.fetchall():

        key = str(source_track_id).strip()

        if key in mapping and mapping[key] != track_id:
            ambiguous.add(key)
        else:
            mapping[key] = track_id

    for key in ambiguous:
        mapping.pop(key, None)

    return mapping, ambiguous


def load_artist_map(cursor):
    """
    Builds a case-insensitive artist-name lookup.

    Only uniquely resolved artist names are retained.
    """

    cursor.execute(
        """
        SELECT
            artist_id,
            artist_name
        FROM artists
        WHERE artist_name IS NOT NULL
        """
    )

    candidates = {}

    for artist_id, artist_name in cursor.fetchall():

        key = artist_name_key(artist_name)

        if key is None:
            continue

        candidates.setdefault(
            key,
            set()
        ).add(artist_id)

    unique_map = {}
    ambiguous = set()

    for key, ids in candidates.items():

        if len(ids) == 1:
            unique_map[key] = next(iter(ids))
        else:
            ambiguous.add(key)

    return unique_map, ambiguous


def resolve_artist_id(
    source_artist_label,
    artist_map
):
    """
    We only attach an artist_id where the intelligence source row
    represents exactly ONE artist.

    Example:

        ['AURORA']
            -> may link to the PMIP AURORA row

        ['Artist A', 'Artist B']
            -> artist_id remains NULL

    The complete multi-artist source identity is still retained
    through source_artist_label and source_artist_key.
    """

    artists = parse_artist_list(
        source_artist_label
    )

    if len(artists) != 1:
        return None

    key = artist_name_key(
        artists[0]
    )

    if key is None:
        return None

    return artist_map.get(key)


# ============================================================
# 9. BATCH EXECUTION
# ============================================================

def execute_batches(
    connection,
    cursor,
    query,
    rows,
    label,
    batch_size=BATCH_SIZE
):
    total_rows = len(rows)

    if total_rows == 0:
        print(f"{label}: no rows to insert.")
        return 0

    inserted = 0
    batch_number = 0
    total_batches = (
        total_rows + batch_size - 1
    ) // batch_size

    for start in range(
        0,
        total_rows,
        batch_size
    ):
        batch_number += 1

        batch = rows[
            start:start + batch_size
        ]

        cursor.executemany(
            query,
            batch
        )

        connection.commit()

        inserted += len(batch)

        print(
            f"Batch {batch_number:03d}/{total_batches:03d}"
            f" | inserted={len(batch):,}"
            f" | total={inserted:,}"
            f" | {label}"
        )

    return inserted


# ============================================================
# 10. CLEANUP CURRENT FAILED RUN
# ============================================================

def cleanup_failed_run(
    connection,
    cursor,
    run_id
):
    if run_id is None:
        return

    heading(
        "Cleaning failed market-growth import run"
    )

    tables = [
        "track_market_growth",
        "artist_market_growth",
        "track_growth_intelligence",
        "artist_growth_intelligence",
        "country_market_growth",
    ]

    try:
        for table in tables:

            cursor.execute(
                f"""
                DELETE FROM {table}
                WHERE run_id = %s
                """,
                (run_id,)
            )

            print(
                f"{table}: "
                f"{cursor.rowcount:,} rows removed"
            )

        cursor.execute(
            """
            DELETE FROM intelligence_runs
            WHERE run_id = %s
              AND component_name = %s
            """,
            (
                run_id,
                COMPONENT_NAME,
            )
        )

        connection.commit()

        print(
            f"Failed intelligence run {run_id} cleaned successfully."
        )

    except Exception as cleanup_error:

        connection.rollback()

        print(
            "WARNING: automatic cleanup could not be completed:"
        )
        print(cleanup_error)


# ============================================================
# 11. MAIN IMPORT
# ============================================================

connection = None
cursor = None
run_id = None

try:

    # --------------------------------------------------------
    # 11.1 Validate source files
    # --------------------------------------------------------

    heading(
        "PMIP Market Growth Intelligence Import"
    )

    source_files = [
        COUNTRY_FILE,
        TRACK_MARKET_FILE,
        TRACK_FINAL_FILE,
        ARTIST_MARKET_FILE,
        ARTIST_FINAL_FILE,
    ]

    for path in source_files:
        require_file(path)
        print(f"FOUND: {path.relative_to(PROJECT_ROOT)}")


    # --------------------------------------------------------
    # 11.2 Load source files
    # --------------------------------------------------------

    heading(
        "Loading market-growth source files"
    )

    country_df = pd.read_csv(
        COUNTRY_FILE,
        low_memory=False
    )

    track_market_df = pd.read_csv(
        TRACK_MARKET_FILE,
        low_memory=False
    )

    track_final_df = pd.read_csv(
        TRACK_FINAL_FILE,
        low_memory=False
    )

    artist_market_df = pd.read_csv(
        ARTIST_MARKET_FILE,
        low_memory=False
    )

    artist_final_df = pd.read_csv(
        ARTIST_FINAL_FILE,
        low_memory=False
    )

    print(
        f"Country rows: {len(country_df):,}"
    )

    print(
        f"Track-market rows: {len(track_market_df):,}"
    )

    print(
        f"Track final intelligence rows: {len(track_final_df):,}"
    )

    print(
        f"Artist-market rows: {len(artist_market_df):,}"
    )

    print(
        f"Artist final intelligence rows: {len(artist_final_df):,}"
    )


    # --------------------------------------------------------
    # 11.3 Validate source columns
    # --------------------------------------------------------

    require_columns(
        country_df,
        [
            "country",
            "emerging_market_score",
            "emerging_market_class",
        ],
        "country_growth_results.csv"
    )

    require_columns(
        track_market_df,
        [
            "track_id",
            "country",
            "market_growth_score",
            "market_growth_class",
        ],
        "track_market_growth_results.csv"
    )

    require_columns(
        track_final_df,
        [
            "track_id",
            "mean_market_growth_score",
            "maximum_track_emerging_market_score",
            "growth_opportunity_score",
            "growth_opportunity_class",
            "pmip_growth_score",
            "pmip_growth_class",
            "pmip_growth_rank",
            "pmip_priority_class",
        ],
        "track_priority_results.csv"
    )

    require_columns(
        artist_market_df,
        [
            "artists",
            "country",
            "market_growth_score",
            "market_growth_class",
        ],
        "artist_market_growth_results.csv"
    )

    require_columns(
        artist_final_df,
        [
            "artists",
            "mean_market_growth_score",
            "maximum_artist_emerging_market_score",
            "growth_opportunity_score",
            "growth_opportunity_class",
            "pmip_growth_score",
            "pmip_growth_class",
            "pmip_growth_rank",
            "pmip_priority_class",
        ],
        "artist_priority_results.csv"
    )


    # --------------------------------------------------------
    # 11.4 Connect to PMIP database
    # --------------------------------------------------------

    heading(
        "Database connection"
    )

    connection = mysql.connector.connect(
        **DB_CONFIG
    )

    cursor = connection.cursor()

    print(
        "PMIP database connection successful."
    )


    # --------------------------------------------------------
    # 11.5 Create intelligence run
    # --------------------------------------------------------

    cursor.execute(
        """
        INSERT INTO intelligence_runs
        (
            component_name,
            component_version
        )
        VALUES (%s, %s)
        """,
        (
            COMPONENT_NAME,
            COMPONENT_VERSION,
        )
    )

    run_id = cursor.lastrowid

    connection.commit()

    print(
        f"Market-growth intelligence run created: {run_id}"
    )


    # --------------------------------------------------------
    # 11.6 Load database identity maps
    # --------------------------------------------------------

    heading(
        "Loading PMIP identity maps"
    )

    (
        country_code_map,
        country_name_map
    ) = load_country_maps(cursor)

    (
        track_map,
        ambiguous_tracks
    ) = load_track_map(cursor)

    (
        artist_map,
        ambiguous_artists
    ) = load_artist_map(cursor)

    print(
        f"Country code mappings: "
        f"{len(country_code_map):,}"
    )

    print(
        f"Country name mappings: "
        f"{len(country_name_map):,}"
    )

    print(
        f"Unique track mappings: "
        f"{len(track_map):,}"
    )

    print(
        f"Ambiguous source track IDs excluded: "
        f"{len(ambiguous_tracks):,}"
    )

    print(
        f"Unique artist-name mappings: "
        f"{len(artist_map):,}"
    )

    print(
        f"Ambiguous artist names excluded: "
        f"{len(ambiguous_artists):,}"
    )


    # ========================================================
    # 12. COUNTRY MARKET GROWTH
    # ========================================================

    heading(
        "Preparing country market-growth intelligence"
    )

    country_rows = []

    unmatched_countries = []

    for _, row in country_df.iterrows():

        source_country = text_or_none(
            row["country"]
        )

        country_id = resolve_country_id(
            source_country,
            country_code_map,
            country_name_map
        )

        if country_id is None:

            unmatched_countries.append(
                source_country
            )

            # country_market_growth currently requires country_id,
            # so an unmatched country cannot safely be inserted.
            continue

        country_rows.append(
            (
                country_id,
                run_id,
                float_or_none(
                    row["emerging_market_score"]
                ),
                text_or_none(
                    row["emerging_market_class"]
                ),
            )
        )

    print(
        f"Source country rows: "
        f"{len(country_df):,}"
    )

    print(
        f"Prepared country rows: "
        f"{len(country_rows):,}"
    )

    print(
        f"Unmatched countries: "
        f"{len(unmatched_countries):,}"
    )

    if unmatched_countries:
        print(
            "Unmatched country values:",
            sorted(
                set(unmatched_countries)
            )
        )

    country_insert_query = """
        INSERT INTO country_market_growth
        (
            country_id,
            run_id,
            emerging_market_score,
            emerging_market_class
        )
        VALUES
        (
            %s, %s, %s, %s
        )
    """

    country_inserted = execute_batches(
        connection,
        cursor,
        country_insert_query,
        country_rows,
        "country growth rows"
    )


    # ========================================================
    # 13. TRACK-MARKET GROWTH
    # ========================================================

    heading(
        "Preparing track-market growth intelligence"
    )

    track_market_rows = []
    unmatched_track_market = []

    linked_track_market = 0
    linked_country_market = 0

    for _, row in track_market_df.iterrows():

        source_track_id = text_or_none(
            row["track_id"]
        )

        source_country = text_or_none(
            row["country"]
        )

        track_id = (
            track_map.get(source_track_id)
            if source_track_id
            else None
        )

        country_id = resolve_country_id(
            source_country,
            country_code_map,
            country_name_map
        )

        if track_id is not None:
            linked_track_market += 1

        if country_id is not None:
            linked_country_market += 1

        if (
            track_id is None
            or country_id is None
        ):
            unmatched_track_market.append(
                {
                    "source_track_id":
                        source_track_id,
                    "source_country":
                        source_country,
                    "track_id":
                        track_id,
                    "country_id":
                        country_id,
                }
            )

        track_market_rows.append(
            (
                source_track_id,
                source_country,
                track_id,
                country_id,
                run_id,
                float_or_none(
                    row["market_growth_score"]
                ),
                text_or_none(
                    row["market_growth_class"]
                ),
            )
        )

    print(
        f"Source rows: "
        f"{len(track_market_df):,}"
    )

    print(
        f"Prepared rows: "
        f"{len(track_market_rows):,}"
    )

    print(
        f"Rows linked to PMIP tracks: "
        f"{linked_track_market:,}"
    )

    print(
        f"Rows linked to PMIP countries: "
        f"{linked_country_market:,}"
    )

    print(
        f"Rows with at least one unresolved mapping: "
        f"{len(unmatched_track_market):,}"
    )

    pd.DataFrame(
        unmatched_track_market
    ).to_csv(
        UNMATCHED_TRACK_MARKET_REPORT,
        index=False
    )

    print(
        f"Audit report: "
        f"{UNMATCHED_TRACK_MARKET_REPORT}"
    )

    track_market_insert_query = """
        INSERT INTO track_market_growth
        (
            source_track_id,
            source_country,
            track_id,
            country_id,
            run_id,
            market_growth_score,
            market_growth_class
        )
        VALUES
        (
            %s, %s, %s, %s, %s, %s, %s
        )
    """

    track_market_inserted = execute_batches(
        connection,
        cursor,
        track_market_insert_query,
        track_market_rows,
        "track-market growth rows"
    )


    # ========================================================
    # 14. ARTIST-MARKET GROWTH
    # ========================================================

    heading(
        "Preparing artist-market growth intelligence"
    )

    artist_market_rows = []
    unmatched_artist_market = []

    artist_market_linked = 0
    artist_market_country_linked = 0
    artist_market_multi_artist = 0

    for _, row in artist_market_df.iterrows():

        source_artist_label = text_or_none(
            row["artists"]
        )

        source_artist_key = (
            exact_source_artist_key(
                source_artist_label
            )
        )

        source_country = text_or_none(
            row["country"]
        )

        artist_list = parse_artist_list(
            source_artist_label
        )

        if len(artist_list) > 1:
            artist_market_multi_artist += 1

        artist_id = resolve_artist_id(
            source_artist_label,
            artist_map
        )

        country_id = resolve_country_id(
            source_country,
            country_code_map,
            country_name_map
        )

        if artist_id is not None:
            artist_market_linked += 1

        if country_id is not None:
            artist_market_country_linked += 1

        if (
            artist_id is None
            or country_id is None
        ):
            unmatched_artist_market.append(
                {
                    "source_artist_label":
                        source_artist_label,
                    "source_artist_key":
                        source_artist_key,
                    "source_country":
                        source_country,
                    "artist_count":
                        len(artist_list),
                    "artist_id":
                        artist_id,
                    "country_id":
                        country_id,
                }
            )

        artist_market_rows.append(
            (
                source_artist_label,
                source_artist_key,
                source_country,
                artist_id,
                country_id,
                run_id,
                float_or_none(
                    row["market_growth_score"]
                ),
                text_or_none(
                    row["market_growth_class"]
                ),
            )
        )

    print(
        f"Source rows: "
        f"{len(artist_market_df):,}"
    )

    print(
        f"Prepared rows: "
        f"{len(artist_market_rows):,}"
    )

    print(
        f"Rows linked to one PMIP artist: "
        f"{artist_market_linked:,}"
    )

    print(
        f"Rows linked to PMIP countries: "
        f"{artist_market_country_linked:,}"
    )

    print(
        f"Multi-artist source rows preserved: "
        f"{artist_market_multi_artist:,}"
    )

    print(
        f"Rows with at least one unresolved mapping: "
        f"{len(unmatched_artist_market):,}"
    )

    pd.DataFrame(
        unmatched_artist_market
    ).to_csv(
        UNMATCHED_ARTIST_MARKET_REPORT,
        index=False
    )

    print(
        f"Audit report: "
        f"{UNMATCHED_ARTIST_MARKET_REPORT}"
    )

    artist_market_insert_query = """
        INSERT INTO artist_market_growth
        (
            source_artist_label,
            source_artist_key,
            source_country,
            artist_id,
            country_id,
            run_id,
            market_growth_score,
            market_growth_class
        )
        VALUES
        (
            %s, %s, %s, %s,
            %s, %s, %s, %s
        )
    """

    artist_market_inserted = execute_batches(
        connection,
        cursor,
        artist_market_insert_query,
        artist_market_rows,
        "artist-market growth rows"
    )


    # ========================================================
    # 15. TRACK FINAL GROWTH INTELLIGENCE
    # ========================================================

    heading(
        "Preparing final track growth intelligence"
    )

    track_final_rows = []
    unmatched_track_final = []

    linked_track_final = 0

    for _, row in track_final_df.iterrows():

        source_track_id = text_or_none(
            row["track_id"]
        )

        track_id = (
            track_map.get(source_track_id)
            if source_track_id
            else None
        )

        if track_id is not None:
            linked_track_final += 1
        else:
            unmatched_track_final.append(
                {
                    "source_track_id":
                        source_track_id
                }
            )

        track_final_rows.append(
            (
                source_track_id,
                track_id,
                run_id,

                float_or_none(
                    row["mean_market_growth_score"]
                ),

                float_or_none(
                    row[
                        "maximum_track_emerging_market_score"
                    ]
                ),

                float_or_none(
                    row["growth_opportunity_score"]
                ),

                text_or_none(
                    row["growth_opportunity_class"]
                ),

                float_or_none(
                    row["pmip_growth_score"]
                ),

                text_or_none(
                    row["pmip_growth_class"]
                ),

                int_or_none(
                    row["pmip_growth_rank"]
                ),

                text_or_none(
                    row["pmip_priority_class"]
                ),
            )
        )

    print(
        f"Source rows: "
        f"{len(track_final_df):,}"
    )

    print(
        f"Prepared rows: "
        f"{len(track_final_rows):,}"
    )

    print(
        f"Rows linked to PMIP tracks: "
        f"{linked_track_final:,}"
    )

    print(
        f"Rows without direct PMIP track match: "
        f"{len(unmatched_track_final):,}"
    )

    pd.DataFrame(
        unmatched_track_final
    ).to_csv(
        UNMATCHED_TRACK_FINAL_REPORT,
        index=False
    )

    print(
        f"Audit report: "
        f"{UNMATCHED_TRACK_FINAL_REPORT}"
    )

    track_final_insert_query = """
        INSERT INTO track_growth_intelligence
        (
            source_track_id,
            track_id,
            run_id,
            mean_market_growth_score,
            maximum_track_emerging_market_score,
            growth_opportunity_score,
            growth_opportunity_class,
            pmip_growth_score,
            pmip_growth_class,
            pmip_growth_rank,
            pmip_priority_class
        )
        VALUES
        (
            %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s
        )
    """

    track_final_inserted = execute_batches(
        connection,
        cursor,
        track_final_insert_query,
        track_final_rows,
        "track final growth intelligence rows"
    )


    # ========================================================
    # 16. ARTIST FINAL GROWTH INTELLIGENCE
    # ========================================================

    heading(
        "Preparing final artist growth intelligence"
    )

    artist_final_rows = []
    unmatched_artist_final = []

    linked_artist_final = 0
    multi_artist_final = 0

    for _, row in artist_final_df.iterrows():

        source_artist_label = text_or_none(
            row["artists"]
        )

        source_artist_key = (
            exact_source_artist_key(
                source_artist_label
            )
        )

        artist_list = parse_artist_list(
            source_artist_label
        )

        if len(artist_list) > 1:
            multi_artist_final += 1

        artist_id = resolve_artist_id(
            source_artist_label,
            artist_map
        )

        if artist_id is not None:
            linked_artist_final += 1
        else:
            unmatched_artist_final.append(
                {
                    "source_artist_label":
                        source_artist_label,
                    "source_artist_key":
                        source_artist_key,
                    "artist_count":
                        len(artist_list),
                }
            )

        artist_final_rows.append(
            (
                source_artist_label,
                source_artist_key,
                artist_id,
                run_id,

                float_or_none(
                    row["mean_market_growth_score"]
                ),

                float_or_none(
                    row[
                        "maximum_artist_emerging_market_score"
                    ]
                ),

                float_or_none(
                    row["growth_opportunity_score"]
                ),

                text_or_none(
                    row["growth_opportunity_class"]
                ),

                float_or_none(
                    row["pmip_growth_score"]
                ),

                text_or_none(
                    row["pmip_growth_class"]
                ),

                int_or_none(
                    row["pmip_growth_rank"]
                ),

                text_or_none(
                    row["pmip_priority_class"]
                ),
            )
        )

    print(
        f"Source rows: "
        f"{len(artist_final_df):,}"
    )

    print(
        f"Prepared rows: "
        f"{len(artist_final_rows):,}"
    )

    print(
        f"Rows linked to one PMIP artist: "
        f"{linked_artist_final:,}"
    )

    print(
        f"Multi-artist source identities preserved: "
        f"{multi_artist_final:,}"
    )

    print(
        f"Rows without direct PMIP artist match: "
        f"{len(unmatched_artist_final):,}"
    )

    pd.DataFrame(
        unmatched_artist_final
    ).to_csv(
        UNMATCHED_ARTIST_FINAL_REPORT,
        index=False
    )

    print(
        f"Audit report: "
        f"{UNMATCHED_ARTIST_FINAL_REPORT}"
    )

    artist_final_insert_query = """
        INSERT INTO artist_growth_intelligence
        (
            source_artist_label,
            source_artist_key,
            artist_id,
            run_id,
            mean_market_growth_score,
            maximum_artist_emerging_market_score,
            growth_opportunity_score,
            growth_opportunity_class,
            pmip_growth_score,
            pmip_growth_class,
            pmip_growth_rank,
            pmip_priority_class
        )
        VALUES
        (
            %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s, %s, %s
        )
    """

    artist_final_inserted = execute_batches(
        connection,
        cursor,
        artist_final_insert_query,
        artist_final_rows,
        "artist final growth intelligence rows"
    )


    # ========================================================
    # 17. DATABASE VALIDATION
    # ========================================================

    heading(
        "Market-growth database validation"
    )

    validation_queries = {
        "country": """
            SELECT COUNT(*)
            FROM country_market_growth
            WHERE run_id = %s
        """,

        "track_market": """
            SELECT COUNT(*)
            FROM track_market_growth
            WHERE run_id = %s
        """,

        "artist_market": """
            SELECT COUNT(*)
            FROM artist_market_growth
            WHERE run_id = %s
        """,

        "track_final": """
            SELECT COUNT(*)
            FROM track_growth_intelligence
            WHERE run_id = %s
        """,

        "artist_final": """
            SELECT COUNT(*)
            FROM artist_growth_intelligence
            WHERE run_id = %s
        """,
    }

    stored_counts = {}

    for name, query in validation_queries.items():

        cursor.execute(
            query,
            (run_id,)
        )

        stored_counts[name] = cursor.fetchone()[0]

    print(
        f"Country growth rows stored: "
        f"{stored_counts['country']:,}"
    )

    print(
        f"Track-market growth rows stored: "
        f"{stored_counts['track_market']:,}"
    )

    print(
        f"Artist-market growth rows stored: "
        f"{stored_counts['artist_market']:,}"
    )

    print(
        f"Track final intelligence rows stored: "
        f"{stored_counts['track_final']:,}"
    )

    print(
        f"Artist final intelligence rows stored: "
        f"{stored_counts['artist_final']:,}"
    )


    # --------------------------------------------------------
    # Duplicate checks
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM
        (
            SELECT
                source_track_id,
                source_country,
                run_id,
                COUNT(*) AS occurrences
            FROM track_market_growth
            WHERE run_id = %s
            GROUP BY
                source_track_id,
                source_country,
                run_id
            HAVING COUNT(*) > 1
        ) AS duplicates
        """,
        (run_id,)
    )

    duplicate_track_market = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM
        (
            SELECT
                source_artist_key,
                source_country,
                run_id,
                COUNT(*) AS occurrences
            FROM artist_market_growth
            WHERE run_id = %s
            GROUP BY
                source_artist_key,
                source_country,
                run_id
            HAVING COUNT(*) > 1
        ) AS duplicates
        """,
        (run_id,)
    )

    duplicate_artist_market = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM
        (
            SELECT
                source_track_id,
                run_id,
                COUNT(*) AS occurrences
            FROM track_growth_intelligence
            WHERE run_id = %s
            GROUP BY
                source_track_id,
                run_id
            HAVING COUNT(*) > 1
        ) AS duplicates
        """,
        (run_id,)
    )

    duplicate_track_final = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM
        (
            SELECT
                source_artist_key,
                run_id,
                COUNT(*) AS occurrences
            FROM artist_growth_intelligence
            WHERE run_id = %s
            GROUP BY
                source_artist_key,
                run_id
            HAVING COUNT(*) > 1
        ) AS duplicates
        """,
        (run_id,)
    )

    duplicate_artist_final = cursor.fetchone()[0]


    # --------------------------------------------------------
    # Orphan checks
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM track_market_growth tmg
        LEFT JOIN tracks t
            ON t.track_id = tmg.track_id
        WHERE tmg.run_id = %s
          AND tmg.track_id IS NOT NULL
          AND t.track_id IS NULL
        """,
        (run_id,)
    )

    orphan_track_market_tracks = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM track_market_growth tmg
        LEFT JOIN countries c
            ON c.country_id = tmg.country_id
        WHERE tmg.run_id = %s
          AND tmg.country_id IS NOT NULL
          AND c.country_id IS NULL
        """,
        (run_id,)
    )

    orphan_track_market_countries = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM artist_market_growth amg
        LEFT JOIN artists a
            ON a.artist_id = amg.artist_id
        WHERE amg.run_id = %s
          AND amg.artist_id IS NOT NULL
          AND a.artist_id IS NULL
        """,
        (run_id,)
    )

    orphan_artist_market_artists = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM artist_market_growth amg
        LEFT JOIN countries c
            ON c.country_id = amg.country_id
        WHERE amg.run_id = %s
          AND amg.country_id IS NOT NULL
          AND c.country_id IS NULL
        """,
        (run_id,)
    )

    orphan_artist_market_countries = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM track_growth_intelligence tgi
        LEFT JOIN tracks t
            ON t.track_id = tgi.track_id
        WHERE tgi.run_id = %s
          AND tgi.track_id IS NOT NULL
          AND t.track_id IS NULL
        """,
        (run_id,)
    )

    orphan_track_final = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM artist_growth_intelligence agi
        LEFT JOIN artists a
            ON a.artist_id = agi.artist_id
        WHERE agi.run_id = %s
          AND agi.artist_id IS NOT NULL
          AND a.artist_id IS NULL
        """,
        (run_id,)
    )

    orphan_artist_final = cursor.fetchone()[0]


    # ========================================================
    # 18. FINAL CHECKLIST
    # ========================================================

    heading(
        "Final market-growth intelligence checklist"
    )

    checks = {
        "Country stored count matches prepared count":
            stored_counts["country"]
            == len(country_rows),

        "All track-market source rows preserved":
            stored_counts["track_market"]
            == len(track_market_df),

        "All artist-market source rows preserved":
            stored_counts["artist_market"]
            == len(artist_market_df),

        "All track final source rows preserved":
            stored_counts["track_final"]
            == len(track_final_df),

        "All artist final source rows preserved":
            stored_counts["artist_final"]
            == len(artist_final_df),

        "No duplicate track-market source identities":
            duplicate_track_market == 0,

        "No duplicate artist-market source identities":
            duplicate_artist_market == 0,

        "No duplicate track final source identities":
            duplicate_track_final == 0,

        "No duplicate artist final source identities":
            duplicate_artist_final == 0,

        "No orphan mapped track-market track IDs":
            orphan_track_market_tracks == 0,

        "No orphan mapped track-market country IDs":
            orphan_track_market_countries == 0,

        "No orphan mapped artist-market artist IDs":
            orphan_artist_market_artists == 0,

        "No orphan mapped artist-market country IDs":
            orphan_artist_market_countries == 0,

        "No orphan mapped final track IDs":
            orphan_track_final == 0,

        "No orphan mapped final artist IDs":
            orphan_artist_final == 0,
    }

    for label, passed in checks.items():
        print(
            f"{label}: {passed}"
        )


    # ========================================================
    # 19. FINAL RESULT
    # ========================================================

    all_checks_passed = all(
        checks.values()
    )

    heading(
        "Market-growth intelligence import result"
    )

    if all_checks_passed:

        print(
            "Result: PMIP MARKET GROWTH INTELLIGENCE "
            "IMPORTED SUCCESSFULLY"
        )

    else:

        print(
            "Result: IMPORT COMPLETED, "
            "BUT ONE OR MORE VALIDATION CHECKS FAILED"
        )

    print(
        f"Intelligence run: {run_id}"
    )

    print(
        f"Country market-growth rows: "
        f"{stored_counts['country']:,}"
    )

    print(
        f"Track-market growth rows: "
        f"{stored_counts['track_market']:,}"
    )

    print(
        f"Artist-market growth rows: "
        f"{stored_counts['artist_market']:,}"
    )

    print(
        f"Track growth intelligence rows: "
        f"{stored_counts['track_final']:,}"
    )

    print(
        f"Artist growth intelligence rows: "
        f"{stored_counts['artist_final']:,}"
    )

    print(
        "Exact source artist identities were preserved "
        "without case-collision merging."
    )

    print(
        "Unmatched source track and artist identities remain "
        "preserved in their source identity columns."
    )

    if all_checks_passed:
        print(
            "Market growth intelligence import is now complete."
        )


# ============================================================
# 20. ERROR HANDLING
# ============================================================

except Exception as error:

    heading(
        "IMPORT ERROR"
    )

    print(
        f"{type(error).__name__}: {error}"
    )

    if run_id is not None:

        print()
        print(
            "Attempted market-growth intelligence run:"
        )

        print(
            f"run_id = {run_id}"
        )

        if (
            connection is not None
            and connection.is_connected()
        ):
            cleanup_failed_run(
                connection,
                cursor,
                run_id
            )

    raise


# ============================================================
# 21. CLOSE DATABASE
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