import os
import logging

logger = logging.getLogger("finrelief")

try:
    import google.generativeai as genai
    _GENAI_AVAILABLE = True
except ImportError:
    _GENAI_AVAILABLE = False

_RAW_GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
# Clean up key/placeholder check
GEMINI_API_KEY = _RAW_GEMINI_KEY if _RAW_GEMINI_KEY and _RAW_GEMINI_KEY != "paste_your_gemini_api_key_here" else ""

if _GENAI_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.warning(f"Failed to configure google-generativeai: {e}")
        GEMINI_API_KEY = ""

_GEMINI_API_STATUS = None

def verify_gemini_config():
    """Startup check that logs a warning if the key is missing or fails a test call."""
    global _GEMINI_API_STATUS
    if _GEMINI_API_STATUS is not None:
        return _GEMINI_API_STATUS

    if not _GENAI_AVAILABLE:
        logger.warning("google-generativeai package is not installed. Gemini feature will fall back to templates.")
        _GEMINI_API_STATUS = False
        return False
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY environment variable is not configured. Gemini feature will fall back to templates.")
        _GEMINI_API_STATUS = False
        return False
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        # Try a tiny, cheap token generation to verify key validity
        response = model.generate_content("Ping")
        if response.text:
            logger.info("Gemini API connection test: SUCCESS")
            _GEMINI_API_STATUS = True
            return True
        _GEMINI_API_STATUS = False
        return False
    except Exception as e:
        logger.warning(f"Gemini API test call failed (invalid key or network issue): {e}. Using fallback template instead.")
        _GEMINI_API_STATUS = False
        return False

def generate_letter_body(
    user_name: str,
    user_email: str,
    lender: str,
    loan_type: str,
    amount: float,
    emi: float,
    overdue_days: int,
    settlement_pct: float
) -> tuple[str, str]:
    """Generates the negotiation letter body. Returns (body, source) where source is 'gemini' or 'fallback'."""
    settlement_amount = round(amount * settlement_pct / 100.0)

    if _GENAI_AVAILABLE and GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""You are a financial advisor drafting a professional One Time Settlement (OTS) negotiation letter on behalf of a borrower in India.

Borrower: {user_name} ({user_email})
Lender: {lender}
Loan type: {loan_type}
Outstanding balance: Rs. {amount:,.0f}
Monthly EMI: Rs. {emi:,.0f}
Overdue days: {overdue_days}
Proposed settlement: Rs. {settlement_amount:,.0f} ({settlement_pct:.0f}% of outstanding)

Write a formal, empathetic, and concise OTS letter (200–280 words). Use a professional tone. Include:
1. Salutation to the Loan Recovery Department
2. Subject line about OTS request
3. Brief explanation of financial hardship without excessive detail
4. Clear settlement proposal with amount and timeline (15 working days)
5. Request for credit bureau reporting as "Settled"
6. Professional sign-off

Do NOT include markdown formatting. Output plain text only."""
            response = model.generate_content(prompt)
            body = response.text.strip() if response.text else ""
            if body:
                return body, "gemini"
            logger.warning("Gemini API returned empty text. Falling back to template.")
        except Exception as e:
            logger.warning(f"Failed to generate letter with Gemini API: {e}. Falling back to template.")
            # Fall through to template

    # Template fallback
    body = f"""To,
The Manager - Loan Recovery Department
{lender}

Subject: Request for One Time Settlement (OTS) on Loan Account

Dear Sir/Madam,

I am writing regarding my outstanding {loan_type.lower()} with {lender}, currently overdue by {overdue_days} days, with an outstanding balance of Rs. {amount:,.0f}.

Due to a temporary but significant financial constraint, I have been unable to maintain regular EMI payments of Rs. {emi:,.0f}. After careful assessment of my financial situation, I would like to propose a One Time Settlement of Rs. {settlement_amount:,.0f} (approximately {settlement_pct:.0f}% of the outstanding amount), payable in full within 15 working days of your written approval.

I believe this settlement would be mutually beneficial — it allows you to recover a substantial portion of the outstanding balance while helping me avoid further financial distress. I am committed to honouring this agreement promptly upon your approval.

I sincerely request you to consider this proposal favourably. Upon settlement, I kindly request that you report my account status to the credit bureau as "Settled."

I am available for any discussion or documentation required and can be reached at {user_email}.

Yours sincerely,
{user_name}
{user_email}"""
    return body, "fallback"
