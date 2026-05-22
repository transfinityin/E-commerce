import gspread
from google.oauth2.service_account import Credentials
from django.conf import settings

def get_sheets_client():
    creds = Credentials.from_service_account_file(
        settings.GOOGLE_SHEET_ID,
        scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return gspread.authorize(creds)

def log_to_sheet(worksheet_name, row_data):
    """
    row_data = list of values to append
    """
    try:
        client = get_sheets_client()
        sheet = client.open_by_key(settings.GOOGLE_SHEET_ID)
        worksheet = sheet.worksheet(worksheet_name)
        worksheet.append_row(row_data)
        return True
    except Exception as e:
        print(f"❌ Google Sheets Error: {e}")
        return False