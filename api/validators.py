"""
GEARIFY-Remastered — Input Validation & Sanitization Module

Provides strict input validation, type enforcement, and sanitization
to protect against SQL Injection, Command Injection, XSS, and Unsafe File Uploads.
"""

import re
import os
from werkzeug.utils import secure_filename

# Allowed MIME types and extensions for photo uploads
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Max upload file size (5 MB)
MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024


def sanitize_text(text: str | None, max_length: int = 255) -> str:
    """Strips leading/trailing whitespace, null bytes, and truncates to max_length."""
    if not text or not isinstance(text, str):
        return ""
    # Strip null bytes and control characters (mitigates log injection & header injection)
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text).strip()
    return cleaned[:max_length]


def sanitize_search_query(query: str | None, max_length: int = 100) -> str:
    """Sanitizes user search terms used in LIKE / ILIKE queries."""
    if not query or not isinstance(query, str):
        return ""
    cleaned = sanitize_text(query, max_length=max_length)
    # Strip wildcard characters that could cause catastrophic backtracking or wildcard denial-of-service
    return re.sub(r'[%_]', '', cleaned)


def validate_email_address(email: str | None) -> tuple[bool, str | None, str]:
    """Validates email format, length, and normalizes to lowercase."""
    if not email or not isinstance(email, str):
        return False, "Email address is required", ""

    cleaned = email.strip().lower()
    if len(cleaned) > 255:
        return False, "Email address cannot exceed 255 characters", ""

    # RFC 5322 compliant simple email regex
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, cleaned):
        return False, "Please provide a valid email address", ""

    return True, None, cleaned


def validate_registration_no(reg_no: str | None) -> tuple[bool, str | None, str]:
    """Validates Pakistani vehicle registration plate formats (e.g. 'APS-2342', 'LHR-7070')."""
    if not reg_no or not isinstance(reg_no, str):
        return False, "Registration number is required", ""

    cleaned = reg_no.strip().upper()
    if len(cleaned) < 2 or len(cleaned) > 20:
        return False, "Registration number must be between 2 and 20 characters long", ""

    # Allow alphanumeric characters, spaces, and hyphens only (blocks SQLi/command injection constructs)
    if not re.match(r'^[A-Z0-9\s\-]+$', cleaned):
        return False, "Registration number contains invalid characters (letters, numbers, hyphens only)", ""

    return True, None, cleaned


def validate_integer_range(
    val: str | int | float | None,
    field_name: str,
    min_val: int = 0,
    max_val: int = 2147483647,
    default: int | None = None
) -> tuple[bool, str | None, int]:
    """Strictly validates and casts integer input within bounds."""
    if val is None or val == "":
        if default is not None:
            return True, None, default
        return False, f"{field_name} is required", 0

    try:
        num = int(float(val))
    except (ValueError, TypeError):
        return False, f"{field_name} must be a valid integer number", 0

    if num < min_val:
        return False, f"{field_name} cannot be less than {min_val}", 0
    if num > max_val:
        return False, f"{field_name} cannot exceed {max_val}", 0

    return True, None, num


def validate_image_file(file_storage, max_size_bytes: int = MAX_UPLOAD_SIZE_BYTES) -> tuple[bool, str | None, str]:
    """
    Validates uploaded file against:
      - File presence
      - Extension allowlist (.jpg, .jpeg, .png, .webp)
      - Content-Type / MIME allowlist
      - File size limits (5 MB max)
      - Path traversal defense via secure_filename
    Returns (is_valid, error_msg, sanitized_safe_filename).
    """
    if not file_storage or not getattr(file_storage, "filename", None):
        return False, "No file provided", ""

    raw_filename = file_storage.filename
    safe_name = secure_filename(raw_filename)
    if not safe_name:
        return False, "Invalid or unsafe file name", ""

    ext = os.path.splitext(safe_name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return False, f"File extension '{ext}' is not allowed. Allowed types: {', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}", ""

    content_type = getattr(file_storage, "content_type", "").lower()
    if content_type and content_type not in ALLOWED_IMAGE_MIME_TYPES:
        return False, f"File Content-Type '{content_type}' is invalid for images", ""

    # Verify file length (seek end)
    file_storage.seek(0, os.SEEK_END)
    size = file_storage.tell()
    file_storage.seek(0)  # reset cursor for downstream processing

    if size == 0:
        return False, "Uploaded file is empty (0 bytes)", ""

    if size > max_size_bytes:
        max_mb = max_size_bytes / (1024 * 1024)
        return False, f"File size exceeds maximum limit of {max_mb:.0f} MB", ""

    return True, None, safe_name
