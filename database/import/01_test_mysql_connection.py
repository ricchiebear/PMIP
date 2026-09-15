from pathlib import Path
import os

import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv


# ============================================================
# Load environment variables
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = PROJECT_ROOT / ".env"

load_dotenv(ENV_PATH)


# ============================================================
# Database connection test
# ============================================================

connection = None

try:
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT")),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )

    if connection.is_connected():
        print("PMIP database connection successful.")

except Error as error:
    print("Database connection failed.")
    print(error)

finally:
    if connection is not None and connection.is_connected():
        connection.close()
        print("Database connection closed.")