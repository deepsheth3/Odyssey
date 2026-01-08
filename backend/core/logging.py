import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

LOG_DIR = Path('backend/logs')
LOG_FILE = LOG_DIR / 'app.log'
LOG_FORMAT = '%(asctime)s | %(name)-8s | %(levelname)s | %(message)s'
DATE_FORMAT = '%Y-%m-%d %H:%M:%S'


def configure_logging():
    """
    Configure the root logger to output to both console and a rotating file.
    """
    # 1. Create Log Directory if does not exist
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    # 2. Setup Handler

    # Console Handler (Stream Data)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_format = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)
    console_handler.setFormatter(console_format)

    # File Handler (Rotating File Data)
    # MAX_BYTES = 1024 * 1024 * 5 # BACKUP_COUNT = 5
    file_handler = RotatingFileHandler(
        LOG_FILE, 
        maxBytes=1024*1024*5, 
        backupCount=5,
        encoding='utf-8')
    file_handler.setLevel(logging.INFO)
    file_format = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)
    file_handler.setFormatter(file_format)

    # 3. Configure Root Logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Avoid Duplicate Log Handlers
    if logger.hasHandlers():
        logger.handlers.clear()

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    # Silence noisy libraries
    logging.getLogger('uvicorn.access').disabled = True
    logging.getLogger('httpx').setLevel(logging.WARNING)

    logger.info(f'Logging configured successfully')
    logger.info(f'Log file is located at: {LOG_FILE}')


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)

    
