import os
import time

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field
from PIL import Image


# =========================================================
# SETUP
# =========================================================

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY missing in .env file.")

MODEL = "gemini-3.5-flash-lite"

client = genai.Client(api_key=API_KEY)


# =========================================================
# AI OUTPUT
# =========================================================

class ImageValidation(BaseModel):

    relevant: bool = Field(
        description=(
            "Whether the image contains a civic issue relevant "
            "to the complaint."
        )
    )

    match: bool = Field(
        description=(
            "True only when the specific civic issue described "
            "in the complaint is visibly supported by the image."
        )
    )

    issue_type: str = Field(
        description=(
            "One of: pothole, road damage, garbage, illegal dumping, "
            "drainage, water leakage, broken streetlight, sanitation, "
            "public infrastructure, traffic obstruction, "
            "other civic issue, or Unknown."
        )
    )

    confidence: int = Field(
        ge=0,
        le=100,
        description="Confidence from 0 to 100."
    )

    reason: str = Field(
        description=(
            "Short factual explanation of whether the image "
            "supports the complaint."
        )
    )


# =========================================================
# IMAGE VALIDATION
# =========================================================

def validate_image(
    image_path: str,
    complaint_text: str
) -> ImageValidation:

    if not os.path.isfile(image_path):

        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    # -----------------------------------------------------
    # Load image safely
    # -----------------------------------------------------

    with Image.open(image_path) as opened_image:

        image = opened_image.convert("RGB").copy()

    # -----------------------------------------------------
    # Strict complaint-image matching prompt
    # -----------------------------------------------------

    prompt = f"""
You are a STRICT image validation system for a civic complaint platform.

CITIZEN COMPLAINT:
{complaint_text}

Your job is NOT only to check whether the image contains
some civic problem.

You MUST check whether the image supports the
SPECIFIC problem described in the complaint.

Supported civic issue categories:

- pothole
- road damage
- garbage
- illegal dumping
- drainage
- water leakage
- broken streetlight
- sanitation
- public infrastructure
- traffic obstruction
- other civic issue
- Unknown

IMPORTANT DECISION RULES:

1. First understand the specific civic issue claimed
   in the complaint.

2. Then inspect the image.

3. "relevant" means the image contains a civic issue
   that is reasonably related to the complaint.

4. "match" is STRICTER than relevant.

5. Set match=true ONLY when the image visibly supports
   the SPECIFIC civic problem described in the complaint.

6. If the complaint says "pothole" but the image shows
   garbage, set:
       relevant=false
       match=false

7. If the complaint says "broken streetlight" but the
   image shows a pothole, set:
       relevant=false
       match=false

8. If the complaint says "garbage dumped on roadside"
   and the image clearly shows garbage/dumping, set:
       relevant=true
       match=true

9. If the complaint describes one civic issue but the
   image shows a different civic issue, DO NOT accept it
   as a match.

10. If the image is a selfie, portrait, food photo,
    random personal photo, unrelated scenery, unrelated
    animal, screenshot, or other unrelated content:
       relevant=false
       match=false
       issue_type="Unknown"

11. If the image is too unclear to determine the issue:
       relevant=false
       match=false
       issue_type="Unknown"

12. Do not invent facts.

13. Do not judge whether the citizen is lying or committing
    fraud. Only determine visual evidence and matching.

14. confidence must be between 0 and 100.

15. Keep reason short and factual.

EXAMPLES:

Example 1:

Complaint:
"There is a large pothole on the road."

Image:
Clearly shows a pothole.

Result:
relevant=true
match=true
issue_type="pothole"

Example 2:

Complaint:
"There is a large pothole on the road."

Image:
Clearly shows a garbage pile.

Result:
relevant=false
match=false
issue_type="garbage"

Example 3:

Complaint:
"The streetlight is broken."

Image:
Clearly shows a broken streetlight.

Result:
relevant=true
match=true
issue_type="broken streetlight"

Example 4:

Complaint:
"The streetlight is broken."

Image:
Clearly shows a pothole.

Result:
relevant=false
match=false
issue_type="pothole"

Example 5:

Complaint:
"There is garbage dumped near the park."

Image:
Clearly shows garbage dumped near a public area.

Result:
relevant=true
match=true
issue_type="garbage"

Example 6:

Complaint:
"There is garbage dumped near the park."

Image:
Selfie of a person.

Result:
relevant=false
match=false
issue_type="Unknown"

Return structured JSON only.
"""

    # -----------------------------------------------------
    # Gemini request with retry
    # -----------------------------------------------------

    max_retries = 3

    response = None

    for attempt in range(max_retries):

        try:

            response = client.models.generate_content(
                model=MODEL,
                contents=[
                    prompt,
                    image
                ],
                config={
                    "response_mime_type":
                        "application/json",

                    "response_schema":
                        ImageValidation
                },
            )

            break

        except Exception as error:

            error_text = str(error).lower()

            retryable = (
                "503" in error_text
                or "unavailable" in error_text
                or "429" in error_text
                or "resource exhausted" in error_text
            )

            if (
                not retryable
                or attempt == max_retries - 1
            ):
                raise

            wait_time = 2 ** attempt

            print(
                f"⚠️ Gemini temporarily unavailable. "
                f"Retrying in {wait_time}s..."
            )

            time.sleep(wait_time)

    if response is None:

        raise RuntimeError(
            "Gemini did not return a response."
        )

    return ImageValidation.model_validate_json(
        response.text
    )


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    image_path = "test_images/pothole.jpg"

    complaint = (
        "There is a broken streetlight near the main road."
    )

    try:

        result = validate_image(
            image_path,
            complaint
        )

        print("=" * 55)
        print("             AI IMAGE VALIDATION")
        print("=" * 55)

        print(
            f"Relevant: {result.relevant}"
        )

        print(
            f"Match: {result.match}"
        )

        print(
            f"Issue type: {result.issue_type}"
        )

        print(
            f"Confidence: {result.confidence}"
        )

        print(
            f"Reason: {result.reason}"
        )

        print("=" * 55)

    except FileNotFoundError as error:

        print(
            f"❌ {error}"
        )

    except Exception as error:

        print(
            f"❌ Image validation error: {error}"
        )