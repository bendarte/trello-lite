import time
import psycopg2
import os
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_db():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        logger.error("DATABASE_URL environment variable not set")
        sys.exit(1)

    max_retries = 30
    retry_interval = 2

    for i in range(max_retries):
        try:
            logger.info(f"Attempting to connect to database (attempt {i + 1}/{max_retries})")
            conn = psycopg2.connect(db_url)
            conn.close()
            logger.info("Successfully connected to database")
            return
        except psycopg2.OperationalError as e:
            if i < max_retries - 1:
                logger.warning(f"Could not connect to database: {e}")
                logger.info(f"Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error("Max retries reached. Could not connect to database.")
                raise

if __name__ == "__main__":
    wait_for_db() 