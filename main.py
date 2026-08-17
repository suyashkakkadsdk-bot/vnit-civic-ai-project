import os
import json
import re
import mimetypes
import math
import tempfile
from datetime import datetime, timezone
from difflib import SequenceMatcher

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from image_validator import validate_image


# ============================================================
# SMART CIVIC AI
# PART 1 / 2
# ============================================================

# -----------------------------
# CONFIGURATION
# -----------------------------

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY missing. Add it to your .env file."
    )

MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.5-flash"
)

DATA_FILE = "complaints.json"

MAX_IMAGE_SIZE = 10 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

# Duplicate threshold
DUPLICATE_THRESHOLD = 0.72

# Location validation threshold
MAX_COMPLAINT_DISTANCE_METERS = 500.0

# Image confidence threshold
MIN_IMAGE_CONFIDENCE = 60

# Minimum confidence before accepting AI result
MIN_AI_CONFIDENCE = 50


client = genai.Client(api_key=API_KEY)


# ============================================================
# AI OUTPUT SCHEMA
# ============================================================

class ComplaintAnalysis(BaseModel):

    category: str = Field(
        description="Civic issue category."
    )

    severity: str = Field(
        description="Exactly one of Low, Medium, High, Critical."
    )

    urgency_score: int = Field(
        description="Urgency score from 0 to 100."
    )

    summary: str = Field(
        description="Short factual summary."
    )

    recommended_department: str = Field(
        description="Department responsible for the issue."
    )

    visual_problem_detected: bool = Field(
        description="Whether the image visibly shows a civic problem."
    )

    visual_description: str = Field(
        description="Only describe clearly visible information."
    )

    image_confidence: int = Field(
        description="Confidence from 0 to 100."
    )


# ============================================================
# DATABASE
# ============================================================

def load_complaints():

    if not os.path.exists(DATA_FILE):
        return []

    try:

        with open(
            DATA_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

        if isinstance(data, list):
            return data

        print(
            "WARNING: complaints.json does not contain a list."
        )

        return []

    except json.JSONDecodeError:

        print(
            "WARNING: complaints.json contains invalid JSON."
        )

        return []

    except OSError as error:

        print(
            f"WARNING: Could not read database: {error}"
        )

        return []


def save_complaints(complaints):

    # Atomic save:
    # write temporary file first,
    # then replace the original database.

    directory = os.path.dirname(
        os.path.abspath(DATA_FILE)
    )

    try:

        fd, temp_path = tempfile.mkstemp(
            prefix="complaints_",
            suffix=".tmp",
            dir=directory,
            text=True
        )

        try:

            with os.fdopen(
                fd,
                "w",
                encoding="utf-8"
            ) as file:

                json.dump(
                    complaints,
                    file,
                    indent=4,
                    ensure_ascii=False
                )

                file.flush()
                os.fsync(file.fileno())

            os.replace(
                temp_path,
                DATA_FILE
            )

        except Exception:

            try:
                os.remove(temp_path)
            except OSError:
                pass

            raise

    except OSError as error:

        raise RuntimeError(
            f"Could not save database: {error}"
        )


# ============================================================
# TEXT NORMALIZATION
# ============================================================

STOP_WORDS = {
    "there",
    "is",
    "a",
    "an",
    "the",
    "near",
    "at",
    "in",
    "on",
    "of",
    "to",
    "for",
    "with",
    "and",
    "reported",
    "large",
    "big",
    "very",
    "this",
    "that",
    "road",
    "problem",
}


def normalize_text(text):

    if not text:
        return ""

    text = str(text).lower()

    text = re.sub(
        r"[^a-z0-9\s]",
        " ",
        text
    )

    words = text.split()

    words = [
        word
        for word in words
        if word not in STOP_WORDS
    ]

    return " ".join(words)


# ============================================================
# TOKEN SIMILARITY
# ============================================================

def token_similarity(text1, text2):

    words1 = set(
        normalize_text(text1).split()
    )

    words2 = set(
        normalize_text(text2).split()
    )

    if not words1 or not words2:
        return 0.0

    intersection = words1 & words2
    union = words1 | words2

    return len(intersection) / len(union)


# ============================================================
# STRING SIMILARITY
# ============================================================

def string_similarity(text1, text2):

    clean1 = normalize_text(text1)
    clean2 = normalize_text(text2)

    if not clean1 or not clean2:
        return 0.0

    return SequenceMatcher(
        None,
        clean1,
        clean2
    ).ratio()


# ============================================================
# DUPLICATE SCORE
# ============================================================

def calculate_duplicate_score(
    new_text,
    old_text
):

    token_score = token_similarity(
        new_text,
        old_text
    )

    string_score = string_similarity(
        new_text,
        old_text
    )

    return (
        token_score * 0.60
        +
        string_score * 0.40
    )


# ============================================================
# DISTANCE CALCULATION
# ============================================================

def haversine_distance_meters(
    lat1,
    lon1,
    lat2,
    lon2
):

    radius = 6371000.0

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    delta_lat = math.radians(
        lat2 - lat1
    )

    delta_lon = math.radians(
        lon2 - lon1
    )

    a = (
        math.sin(delta_lat / 2) ** 2
        +
        math.cos(lat1)
        *
        math.cos(lat2)
        *
        math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return radius * c


# ============================================================
# DUPLICATE DETECTION
# ============================================================

def find_duplicate(
    new_complaint,
    new_latitude,
    new_longitude,
    old_complaints
):

    best_score = 0.0
    best_match = None

    for old in old_complaints:

        old_text = old.get(
            "complaint",
            ""
        )

        if not old_text:
            continue

        text_score = calculate_duplicate_score(
            new_complaint,
            old_text
        )

        # ------------------------------------------
        # LOCATION BONUS
        # ------------------------------------------

        location_score = 0.0

        old_location = old.get(
            "location",
            {}
        )

        try:

            old_latitude = float(
                old_location.get(
                    "latitude"
                )
            )

            old_longitude = float(
                old_location.get(
                    "longitude"
                )
            )

            distance = haversine_distance_meters(
                new_latitude,
                new_longitude,
                old_latitude,
                old_longitude
            )

            # Same/similar location increases
            # duplicate confidence.

            if distance <= 100:
                location_score = 0.15

            elif distance <= 300:
                location_score = 0.08

        except (
            TypeError,
            ValueError
        ):
            pass

        final_score = min(
            1.0,
            text_score + location_score
        )

        if final_score > best_score:

            best_score = final_score
            best_match = old

    is_duplicate = (
        best_score >= DUPLICATE_THRESHOLD
    )

    return (
        is_duplicate,
        best_score,
        best_match
    )


# ============================================================
# LOCATION VALIDATION
# ============================================================

def validate_location(
    complaint_latitude,
    complaint_longitude,
    user_latitude,
    user_longitude
):

    distance = haversine_distance_meters(
        complaint_latitude,
        complaint_longitude,
        user_latitude,
        user_longitude
    )

    valid = (
        distance <= MAX_COMPLAINT_DISTANCE_METERS
    )

    if valid:

        reason = (
            "User location is within the "
            "acceptable distance of the "
            "complaint location."
        )

    else:

        reason = (
            "User location is too far from "
            "the complaint location."
        )

    return {
        "valid": valid,
        "distance_meters": round(
            distance,
            2
        ),
        "reason": reason
    }


# ============================================================
# IMAGE PREPARATION
# ============================================================

def prepare_image(image_path):

    if not image_path:
        return None, None

    image_path = (
        image_path
        .strip()
        .strip('"')
        .strip("'")
    )

    if not os.path.isfile(image_path):

        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    file_size = os.path.getsize(
        image_path
    )

    if file_size <= 0:

        raise ValueError(
            "Image file is empty."
        )

    if file_size > MAX_IMAGE_SIZE:

        raise ValueError(
            "Image is larger than 10 MB."
        )

    mime_type, _ = mimetypes.guess_type(
        image_path
    )

    if mime_type not in ALLOWED_IMAGE_TYPES:

        raise ValueError(
            "Unsupported image format. "
            "Use JPG, PNG, or WEBP."
        )

    with open(
        image_path,
        "rb"
    ) as image_file:

        image_bytes = image_file.read()

    image_part = types.Part.from_bytes(
        data=image_bytes,
        mime_type=mime_type
    )

    return image_part, mime_type


# ============================================================
# AI COMPLAINT ANALYSIS
# ============================================================

def analyze_complaint(
    complaint_text,
    image_part=None
):

    prompt = f"""
You are an AI system for a municipal
civic complaint platform.

Analyze the citizen complaint.

CITIZEN COMPLAINT:
{complaint_text}

Analyze the image if one is provided.

STRICT RULES:

1. Never invent visual facts.

2. The image must NOT automatically determine
   severity.

3. If the image does not support the complaint,
   set visual_problem_detected to false.

4. visual_description must contain only
   clearly visible information.

5. image_confidence must be between 0 and 100.

6. urgency_score must be between 0 and 100.

7. severity MUST be exactly one of:

Low
Medium
High
Critical

8. Use practical civic categories such as:

Waste Management
Road Damage
Water Leakage
Streetlight
Drainage
Sanitation
Traffic
Illegal Dumping
Public Safety
Other

9. recommended_department should identify
   the appropriate municipal department.

10. Do not claim certainty when the evidence
    is unclear.

Return only structured JSON matching the schema.
"""

    contents = [prompt]

    if image_part is not None:
        contents.append(image_part)

    response = client.models.generate_content(

        model=MODEL,

        contents=contents,

        config={
            "response_mime_type": "application/json",
            "response_schema": ComplaintAnalysis,
        }
    )

    if not response.text:

        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return ComplaintAnalysis.model_validate_json(
        response.text
    )


# ============================================================
# SAFE VALUE HELPERS
# ============================================================

def clamp(
    value,
    minimum,
    maximum
):

    try:
        value = int(value)
    except (
        TypeError,
        ValueError
    ):
        value = minimum

    return max(
        minimum,
        min(
            maximum,
            value
        )
    )


def validate_coordinates(
    latitude,
    longitude
):

    if not (
        -90 <= latitude <= 90
    ):

        raise ValueError(
            "Latitude must be between -90 and 90."
        )

    if not (
        -180 <= longitude <= 180
    ):

        raise ValueError(
            "Longitude must be between -180 and 180."
        )


def get_float_input(
    prompt
):

    while True:

        try:

            value = float(
                input(prompt).strip()
            )

            return value

        except ValueError:

            print(
                "Invalid number. Please try again."
            )


def get_yes_no(
    prompt
):

    while True:

        answer = (
            input(prompt)
            .strip()
            .lower()
        )

        if answer in {
            "y",
            "yes"
        }:

            return True

        if answer in {
            "n",
            "no"
        }:

            return False

        print(
            "Please enter y or n."
        )


# ============================================================
# COMPLAINT ID
# ============================================================

def generate_complaint_id(
    existing_complaints
):

    highest_number = 0

    for complaint in existing_complaints:

        complaint_id = str(
            complaint.get(
                "complaint_id",
                ""
            )
        )

        match = re.search(
            r"(\d+)$",
            complaint_id
        )

        if match:

            highest_number = max(
                highest_number,
                int(match.group(1))
            )

    return (
        f"COMP-{highest_number + 1:05d}"
    )


# ============================================================
# TIMESTAMP
# ============================================================

def current_timestamp():

    return datetime.now(
        timezone.utc
    ).isoformat(
        timespec="seconds"
    )


# ============================================================
# DISPLAY HELPERS
# ============================================================

def print_header(title):

    print()
    print("=" * 70)
    print(
        f" {title}"
    )
    print("=" * 70)


def print_image_validation(
    validation
):

    print_header(
        "AI IMAGE VALIDATION"
    )

    print(
        f"Relevant     : "
        f"{validation.relevant}"
    )

    print(
        f"Match        : "
        f"{validation.match}"
    )

    print(
        f"Issue type   : "
        f"{validation.issue_type}"
    )

    print(
        f"Confidence   : "
        f"{validation.confidence}"
    )

    print(
        f"Reason       : "
        f"{validation.reason}"
    )


def print_location_validation(
    result
):

    print_header(
        "LOCATION VALIDATION"
    )

    print(
        f"Valid        : "
        f"{result['valid']}"
    )

    print(
        f"Distance     : "
        f"{result['distance_meters']} meters"
    )

    print(
        f"Reason       : "
        f"{result['reason']}"
    )
# ============================================================
# SMART CIVIC AI
# PART 2 / 2
# ============================================================


# ============================================================
# USER LOCATION
# ============================================================

def get_user_location():

    print_header(
        "USER LOCATION"
    )

    print(
        "Enter user's current GPS coordinates."
    )

    print(
        "For testing, you can enter any valid "
        "latitude/longitude."
    )

    latitude = get_float_input(
        "User latitude: "
    )

    longitude = get_float_input(
        "User longitude: "
    )

    validate_coordinates(
        latitude,
        longitude
    )

    return latitude, longitude


# ============================================================
# COMPLAINT LOCATION
# ============================================================

def get_complaint_location():

    print_header(
        "COMPLAINT LOCATION"
    )

    latitude = get_float_input(
        "Complaint latitude: "
    )

    longitude = get_float_input(
        "Complaint longitude: "
    )

    validate_coordinates(
        latitude,
        longitude
    )

    return latitude, longitude


# ============================================================
# BUILD FINAL RECORD
# ============================================================

def build_record(
    complaint_id,
    complaint,
    complaint_latitude,
    complaint_longitude,
    result,
    image_path,
    image_validation,
    duplicate,
    duplicate_score,
    matched,
    location_validation
):

    urgency = clamp(
        result.urgency_score,
        0,
        100
    )

    image_confidence = clamp(
        result.image_confidence,
        0,
        100
    )

    severity = str(
        result.severity
    ).strip()

    allowed_severities = {
        "Low",
        "Medium",
        "High",
        "Critical"
    }

    if severity not in allowed_severities:
        severity = "Medium"

    record = {

        "complaint_id":
            complaint_id,

        "timestamp":
            current_timestamp(),

        "complaint":
            complaint,

        "location": {

            "latitude":
                complaint_latitude,

            "longitude":
                complaint_longitude
        },

        "category":
            result.category.strip(),

        "severity":
            severity,

        "urgency_score":
            urgency,

        "summary":
            result.summary.strip(),

        "recommended_department":
            result.recommended_department.strip(),

        "image": {

            "provided":
                bool(image_path),

            "path":
                image_path
                if image_path
                else None,

            "validator": {

                "relevant":
                    bool(
                        image_validation.relevant
                    )
                    if image_validation
                    else None,

                "match":
                    bool(
                        image_validation.match
                    )
                    if image_validation
                    else None,

                "issue_type":
                    image_validation.issue_type
                    if image_validation
                    else None,

                "confidence":
                    clamp(
                        image_validation.confidence,
                        0,
                        100
                    )
                    if image_validation
                    else None,

                "reason":
                    image_validation.reason
                    if image_validation
                    else None
            },

            "visual_problem_detected":
                bool(
                    result.visual_problem_detected
                ),

            "visual_description":
                result.visual_description.strip(),

            "confidence":
                image_confidence
        },

        "duplicate": {

            "possible":
                bool(duplicate),

            "score":
                round(
                    duplicate_score,
                    3
                ),

            "matched_complaint_id":
                matched.get(
                    "complaint_id"
                )
                if matched
                else None
        },

        "location_validation": {

            "valid":
                bool(
                    location_validation["valid"]
                ),

            "distance_meters":
                location_validation[
                    "distance_meters"
                ],

            "reason":
                location_validation[
                    "reason"
                ]
        }
    }

    return record


# ============================================================
# FINAL DECISION ENGINE
# ============================================================

def determine_status(
    image_path,
    image_validation,
    result,
    duplicate,
    location_validation
):

    reasons = []

    # --------------------------------------------------------
    # IMAGE CHECK
    # --------------------------------------------------------

    image_ok = True

    if image_path:

        if image_validation is None:

            image_ok = False

            reasons.append(
                "Image validation failed."
            )

        else:

            relevant = bool(
                image_validation.relevant
            )

            matched = bool(
                image_validation.match
            )

            confidence = clamp(
                image_validation.confidence,
                0,
                100
            )

            if not relevant:

                image_ok = False

                reasons.append(
                    "Image does not clearly "
                    "show a relevant civic issue."
                )

            elif not matched:

                image_ok = False

                reasons.append(
                    "Image does not match "
                    "the complaint."
                )

            elif confidence < MIN_IMAGE_CONFIDENCE:

                image_ok = False

                reasons.append(
                    "Image confidence is too low."
                )

        if not result.visual_problem_detected:

            image_ok = False

            reasons.append(
                "AI could not confirm the "
                "reported problem visually."
            )

    # --------------------------------------------------------
    # LOCATION CHECK
    # --------------------------------------------------------

    location_ok = bool(
        location_validation["valid"]
    )

    if not location_ok:

        reasons.append(
            "User is outside the allowed "
            "complaint location radius."
        )

    # --------------------------------------------------------
    # DUPLICATE CHECK
    # --------------------------------------------------------

    duplicate_found = bool(
        duplicate
    )

    # --------------------------------------------------------
    # FINAL STATUS
    # --------------------------------------------------------

    if not location_ok:

        status = "REJECTED_LOCATION"

    elif image_path and not image_ok:

        status = "REJECTED_IMAGE_MISMATCH"

    elif duplicate_found:

        status = "POSSIBLE_DUPLICATE"

    else:

        status = "NEW_COMPLAINT"

    return status, reasons


# ============================================================
# DISPLAY FINAL RESULT
# ============================================================

def display_final_result(
    record,
    status,
    reasons
):

    print_header(
        "FINAL AI RESULT"
    )

    print(
        json.dumps(
            record,
            indent=4,
            ensure_ascii=False
        )
    )

    print_header(
        f"STATUS: {status}"
    )

    if reasons:

        print(
            "Decision reasons:"
        )

        for index, reason in enumerate(
            reasons,
            start=1
        ):

            print(
                f"{index}. {reason}"
            )

    else:

        print(
            "All validation checks passed."
        )


# ============================================================
# PROCESS ONE COMPLAINT
# ============================================================

def process_complaint(
    complaints
):

    # --------------------------------------------------------
    # COMPLAINT TEXT
    # --------------------------------------------------------

    complaint = input(
        "\nEnter citizen complaint: "
    ).strip()

    if not complaint:

        print(
            "Complaint cannot be empty."
        )

        return complaints

    if complaint.lower() in {
        "exit",
        "q"
    }:

        raise SystemExit

    # --------------------------------------------------------
    # IMAGE
    # --------------------------------------------------------

    image_path = input(
        "\nEnter image path "
        "(press Enter for no image): "
    ).strip()

    image_part = None
    image_validation = None

    # --------------------------------------------------------
    # PREPARE + VALIDATE IMAGE
    # --------------------------------------------------------

    if image_path:

        print(
            "\nPreparing image..."
        )

        image_part, _ = prepare_image(
            image_path
        )

        print(
            "Validating image..."
        )

        image_validation = validate_image(
            image_path,
            complaint
        )

        print_image_validation(
            image_validation
        )

    # --------------------------------------------------------
    # AI ANALYSIS
    # --------------------------------------------------------

    print_header(
        "AI COMPLAINT ANALYSIS"
    )

    print(
        "Analyzing complaint..."
    )

    result = analyze_complaint(
        complaint,
        image_part
    )

    print(
        f"Category       : "
        f"{result.category}"
    )

    print(
        f"Severity       : "
        f"{result.severity}"
    )

    print(
        f"Urgency        : "
        f"{result.urgency_score}/100"
    )

    print(
        f"Department     : "
        f"{result.recommended_department}"
    )

    print(
        f"Image detected : "
        f"{result.visual_problem_detected}"
    )

    print(
        f"Image confidence: "
        f"{result.image_confidence}/100"
    )

    # --------------------------------------------------------
    # COMPLAINT LOCATION
    # --------------------------------------------------------

    complaint_latitude, complaint_longitude = (
        get_complaint_location()
    )

    # --------------------------------------------------------
    # USER LOCATION
    # --------------------------------------------------------

    user_latitude, user_longitude = (
        get_user_location()
    )

    # --------------------------------------------------------
    # LOCATION VALIDATION
    # --------------------------------------------------------

    location_validation = validate_location(
        complaint_latitude,
        complaint_longitude,
        user_latitude,
        user_longitude
    )

    print_location_validation(
        location_validation
    )

    # --------------------------------------------------------
    # DUPLICATE DETECTION
    # --------------------------------------------------------

    print_header(
        "DUPLICATE DETECTION"
    )

    print(
        "Checking existing complaints..."
    )

    duplicate, duplicate_score, matched = (
        find_duplicate(
            complaint,
            complaint_latitude,
            complaint_longitude,
            complaints
        )
    )

    if duplicate:

        print(
            "Possible duplicate detected."
        )

        print(
            f"Similarity score: "
            f"{duplicate_score:.3f}"
        )

        if matched:

            print(
                "Matched complaint ID: "
                f"{matched.get('complaint_id')}"
            )

    else:

        print(
            "No strong duplicate found."
        )

        print(
            f"Best similarity score: "
            f"{duplicate_score:.3f}"
        )

    # --------------------------------------------------------
    # FINAL DECISION
    # --------------------------------------------------------

    status, reasons = determine_status(
        image_path,
        image_validation,
        result,
        duplicate,
        location_validation
    )

    # --------------------------------------------------------
    # CREATE ID
    # --------------------------------------------------------

    complaint_id = generate_complaint_id(
        complaints
    )

    # --------------------------------------------------------
    # BUILD RECORD
    # --------------------------------------------------------

    record = build_record(
        complaint_id,
        complaint,
        complaint_latitude,
        complaint_longitude,
        result,
        image_path,
        image_validation,
        duplicate,
        duplicate_score,
        matched,
        location_validation
    )

    # --------------------------------------------------------
    # DUPLICATE CONFIRMATION
    # --------------------------------------------------------

    if status == "POSSIBLE_DUPLICATE":

        print()

        save_duplicate = get_yes_no(
            "Possible duplicate detected. "
            "Save as new complaint anyway? (y/n): "
        )

        if not save_duplicate:

            print_header(
                "COMPLAINT NOT SAVED"
            )

            print(
                "Existing complaint appears "
                "to cover the same issue."
            )

            print(
                f"Matched ID: "
                f"{matched.get('complaint_id')}"
            )

            return complaints

        status = "NEW_COMPLAINT_CONFIRMED"

    # --------------------------------------------------------
    # REJECTED LOCATION
    # --------------------------------------------------------

    if status == "REJECTED_LOCATION":

        print_header(
            "COMPLAINT REJECTED"
        )

        print(
            "User is too far from the "
            "complaint location."
        )

        print(
            f"Distance: "
            f"{location_validation['distance_meters']} meters"
        )

        return complaints

    # --------------------------------------------------------
    # REJECTED IMAGE
    # --------------------------------------------------------

    if status == "REJECTED_IMAGE_MISMATCH":

        print_header(
            "COMPLAINT FLAGGED"
        )

        print(
            "The uploaded image does not "
            "reliably support the complaint."
        )

        print(
            "Complaint was NOT saved."
        )

        if reasons:

            for reason in reasons:

                print(
                    f"- {reason}"
                )

        return complaints

    # --------------------------------------------------------
    # SAVE ONLY AFTER VALIDATIONS
    # --------------------------------------------------------

    complaints.append(
        record
    )

    save_complaints(
        complaints
    )

    # --------------------------------------------------------
    # DISPLAY
    # --------------------------------------------------------

    display_final_result(
        record,
        status,
        reasons
    )

    return complaints


# ============================================================
# MAIN APPLICATION
# ============================================================

def main():

    complaints = load_complaints()

    print()
    print("=" * 70)
    print("                    SMART CIVIC AI")
    print("=" * 70)

    print(
        f"Loaded complaints: "
        f"{len(complaints)}"
    )

    print()
    print(
        "System Ready."
    )

    print(
        "Type 'exit' or 'q' to stop."
    )

    while True:

        try:

            complaints = process_complaint(
                complaints
            )

        except SystemExit:

            print()
            print(
                "System shutting down..."
            )

            break

        except KeyboardInterrupt:

            print()
            print()
            print(
                "Process interrupted."
            )

            break

        except FileNotFoundError as error:

            print()
            print(
                f"IMAGE ERROR: {error}"
            )

        except ValueError as error:

            print()
            print(
                f"INPUT ERROR: {error}"
            )

        except RuntimeError as error:

            print()
            print(
                f"SYSTEM ERROR: {error}"
            )

        except Exception as error:

            print()
            print(
                f"UNEXPECTED ERROR: {error}"
            )

            print(
                "The current complaint was "
                "not saved."
            )


# ============================================================
# APPLICATION ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()