import gspread
import json
import os
import traceback
from django.conf import settings
from google.oauth2.service_account import Credentials

GOOGLE_SHEET_ID = getattr(
    settings,
    'GOOGLE_SHEET_ID',
    '1Cg0WdYbJSzrbzviaKmZ-NBXzvf_QgpTGoXw6o2aARfQ'
)

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']


def get_sheets_client():
    """
    Auth priority:
    1. GOOGLE_SERVICE_ACCOUNT_JSON env var (Render/production)
    2. service_account.json file (local development)
    """
    try:
        # ── Production: read from environment variable ──
        json_str = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON')
        if json_str:
            print("🔑 Using GOOGLE_SERVICE_ACCOUNT_JSON env var")
            info = json.loads(json_str)
            creds = Credentials.from_service_account_info(info, scopes=SCOPES)
            print("✅ Credentials loaded from env")
            return gspread.authorize(creds)

        # ── Local: read from file ──
        file_path = os.path.join(os.path.dirname(__file__), 'service_account.json')
        if os.path.exists(file_path):
            print(f"📁 Using local service_account.json")
            creds = Credentials.from_service_account_file(file_path, scopes=SCOPES)
            print("✅ Credentials loaded from file")
            return gspread.authorize(creds)

        print("❌ No credentials found. Set GOOGLE_SERVICE_ACCOUNT_JSON env var on Render.")
        return None

    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in GOOGLE_SERVICE_ACCOUNT_JSON: {e}")
        return None
    except Exception as e:
        print(f"❌ Auth error: {type(e).__name__}: {e}")
        traceback.print_exc()
        return None


def log_to_sheet(worksheet_name, row_data):
    """Append a row to the given worksheet."""
    try:
        client = get_sheets_client()
        if not client:
            return False

        sheet     = client.open_by_key(GOOGLE_SHEET_ID)
        worksheet = sheet.worksheet(worksheet_name)
        worksheet.append_row(row_data)

        print(f"✅ Logged to '{worksheet_name}': {row_data}")
        return True

    except gspread.exceptions.SpreadsheetNotFound:
        print(f"❌ Spreadsheet not found. Check sheet ID and sharing settings.")
        return False
    except gspread.exceptions.WorksheetNotFound:
        print(f"❌ Worksheet '{worksheet_name}' not found.")
        return False
    except Exception as e:
        print(f"❌ Sheets error: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False