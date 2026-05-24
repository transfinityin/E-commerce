import gspread
from google.oauth2.service_account import Credentials
from django.conf import settings
import os
import traceback

# File path to service account JSON
SERVICE_ACCOUNT_FILE = os.path.join(
    os.path.dirname(__file__), 
    'service_account.json'
)

# Your Google Sheet ID from URL
GOOGLE_SHEET_ID = getattr(
    settings, 
    'GOOGLE_SHEET_ID', 
    '1Cg0WdYbJSzrbzviaKmZ-NBXzvf_QgpTGoXw6o2aARfQ'
)

def get_sheets_client():
    """Authenticate with service account JSON file"""
    try:
        print(f"📁 Looking for: {SERVICE_ACCOUNT_FILE}")
        print(f"📁 Exists: {os.path.exists(SERVICE_ACCOUNT_FILE)}")
        
        creds = Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        print("✅ Credentials loaded")
        return gspread.authorize(creds)
        
    except FileNotFoundError:
        print(f"❌ Service account file not found: {SERVICE_ACCOUNT_FILE}")
        return None
    except Exception as e:
        print(f"❌ Auth error: {type(e).__name__}: {e}")
        traceback.print_exc()
        return None

def log_to_sheet(worksheet_name, row_data):
    """Append row to Google Sheet"""
    try:
        client = get_sheets_client()
        if not client:
            return False
        
        print(f"📊 Opening sheet: {GOOGLE_SHEET_ID}")
        sheet = client.open_by_key(GOOGLE_SHEET_ID)
        
        print(f"📋 Getting worksheet: {worksheet_name}")
        worksheet = sheet.worksheet(worksheet_name)
        
        print(f"📝 Appending: {row_data}")
        worksheet.append_row(row_data)
        
        print(f"✅ Logged to '{worksheet_name}'")
        return True
        
    except gspread.exceptions.SpreadsheetNotFound:
        print(f"❌ Spreadsheet not found. Check: 1) Sheet ID correct? 2) Sheet shared with service account?")
        return False
    except gspread.exceptions.WorksheetNotFound:
        print(f"❌ Worksheet '{worksheet_name}' not found. Available worksheets: {[w.title for w in sheet.worksheets()]}")
        return False
    except Exception as e:
        print(f"❌ Google Sheets Error: {type(e).__name__}: {e}")
        traceback.print_exc()
        return False