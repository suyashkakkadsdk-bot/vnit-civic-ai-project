from pathlib import Path
from hashlib import sha256

from PIL import Image, UnidentifiedImageError
import imagehash


# =========================================================
# CONFIG
# =========================================================

PHASH_THRESHOLD = 8
MAX_IMAGE_SIZE_MB = 15

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp"
}


# =========================================================
# HASHING
# =========================================================

def get_hashes(image_path):
    """
    Generate:
    SHA-256 -> exact file duplicate detection
    pHash   -> visual similarity detection
    """

    path = Path(image_path)

    if not path.is_file():
        raise FileNotFoundError(
            f"Image not found: {path}"
        )

    # -----------------------------------------------------
    # File-size safety check
    # -----------------------------------------------------

    max_bytes = MAX_IMAGE_SIZE_MB * 1024 * 1024

    if path.stat().st_size > max_bytes:
        raise ValueError(
            f"Image is larger than {MAX_IMAGE_SIZE_MB} MB"
        )

    # -----------------------------------------------------
    # SHA-256
    # -----------------------------------------------------

    file_hash = sha256()

    with path.open("rb") as file:

        for chunk in iter(
            lambda: file.read(1024 * 1024),
            b""
        ):
            file_hash.update(chunk)

    sha256_hash = file_hash.hexdigest()

    # -----------------------------------------------------
    # pHash
    # -----------------------------------------------------

    try:

        with Image.open(path) as image:

            image.verify()

        with Image.open(path) as image:

            perceptual_hash = imagehash.phash(image)

    except (UnidentifiedImageError, OSError) as error:

        raise ValueError(
            f"Invalid or corrupted image: {error}"
        )

    return sha256_hash, perceptual_hash


# =========================================================
# IMAGE INDEXING
# =========================================================

def index_images(images):
    """
    Calculate hashes only once for every image.

    Returns:

    {
        Path(...): {
            "sha256": "...",
            "phash": imagehash
        }
    }
    """

    indexed = {}

    for image in images:

        try:

            sha256_hash, phash = get_hashes(image)

            indexed[image] = {
                "sha256": sha256_hash,
                "phash": phash
            }

        except Exception as error:

            print(
                f"⚠️ Skipping {image.name}: {error}"
            )

    return indexed


# =========================================================
# HASH COMPARISON
# =========================================================

def compare_hashes(data1, data2):
    """
    Compare already calculated hashes.

    Returns:

        exact_duplicate
        phash_distance
        visually_similar
    """

    # -----------------------------------------------------
    # Exact file duplicate
    # -----------------------------------------------------

    if data1["sha256"] == data2["sha256"]:

        return {
            "exact_duplicate": True,
            "phash_distance": 0,
            "visually_similar": True
        }

    # -----------------------------------------------------
    # Visual similarity
    # -----------------------------------------------------

    distance = (
        data1["phash"]
        -
        data2["phash"]
    )

    visually_similar = (
        distance <= PHASH_THRESHOLD
    )

    return {
        "exact_duplicate": False,
        "phash_distance": distance,
        "visually_similar": visually_similar
    }


# =========================================================
# FIND IMAGES
# =========================================================

def get_images(folder):
    """
    Find all supported images inside a folder.
    """

    folder = Path(folder)

    if not folder.is_dir():
        raise FileNotFoundError(
            f"Folder not found: {folder}"
        )

    images = []

    for file in folder.iterdir():

        if (
            file.is_file()
            and file.suffix.lower()
            in IMAGE_EXTENSIONS
        ):
            images.append(file)

    return sorted(images)


# =========================================================
# EXACT DUPLICATE GROUPS
# =========================================================

def create_exact_groups(indexed):
    """
    Group images having identical SHA-256.

    These are true exact file duplicates.
    """

    sha_groups = {}

    for image, data in indexed.items():

        sha = data["sha256"]

        if sha not in sha_groups:
            sha_groups[sha] = []

        sha_groups[sha].append(image)

    exact_groups = []

    for group in sha_groups.values():

        if len(group) > 1:

            exact_groups.append(group)

    return exact_groups


# =========================================================
# VISUAL SIMILARITY GROUPS
# =========================================================

def create_visual_groups(indexed, exact_groups):
    """
    Create visual similarity groups.

    Important:
    This does NOT use transitive union.

    Example:

        A similar B
        B similar C
        A different C

    A/B/C will NOT automatically become
    one giant group.

    A representative image is used for
    each visual group.
    """

    exact_paths = set()

    for group in exact_groups:

        for image in group:

            exact_paths.add(image)

    remaining = [
        image
        for image in indexed
        if image not in exact_paths
    ]

    visual_groups = []

    used = set()

    for image in remaining:

        if image in used:
            continue

        representative = image

        current_group = [
            representative
        ]

        used.add(representative)

        for candidate in remaining:

            if candidate in used:
                continue

            comparison = compare_hashes(
                indexed[representative],
                indexed[candidate]
            )

            if comparison["visually_similar"]:

                current_group.append(
                    candidate
                )

                used.add(candidate)

        if len(current_group) > 1:

            visual_groups.append(
                current_group
            )

    return visual_groups


# =========================================================
# COMPLETE SCAN
# =========================================================

def analyze_images(folder):
    """
    Complete image analysis.

    Returns:

    {
        "total_images": ...,
        "processed_images": ...,
        "exact_duplicate_groups": [...],
        "visual_groups": [...],
        "unique_images": [...]
    }
    """

    images = get_images(folder)

    print()
    print("=" * 65)
    print("              CIVIC IMAGE ANALYSIS")
    print("=" * 65)

    print(
        f"Total images found: {len(images)}"
    )

    if not images:

        return {
            "total_images": 0,
            "processed_images": 0,
            "exact_duplicate_groups": [],
            "visual_groups": [],
            "unique_images": []
        }

    # -----------------------------------------------------
    # Hash every image ONCE
    # -----------------------------------------------------

    indexed = index_images(images)

    print(
        f"Successfully processed: {len(indexed)}"
    )

    if not indexed:

        return {
            "total_images": len(images),
            "processed_images": 0,
            "exact_duplicate_groups": [],
            "visual_groups": [],
            "unique_images": []
        }

    # -----------------------------------------------------
    # Exact duplicate detection
    # -----------------------------------------------------

    exact_groups = create_exact_groups(
        indexed
    )

    # -----------------------------------------------------
    # Visual similarity detection
    # -----------------------------------------------------

    visual_groups = create_visual_groups(
        indexed,
        exact_groups
    )

    # -----------------------------------------------------
    # Find all grouped images
    # -----------------------------------------------------

    grouped_images = set()

    for group in exact_groups:

        grouped_images.update(group)

    for group in visual_groups:

        grouped_images.update(group)

    # -----------------------------------------------------
    # Unique images
    # -----------------------------------------------------

    unique_images = [
        image
        for image in indexed
        if image not in grouped_images
    ]

    return {
        "total_images": len(images),
        "processed_images": len(indexed),
        "exact_duplicate_groups": exact_groups,
        "visual_groups": visual_groups,
        "unique_images": unique_images
    }


# =========================================================
# DISPLAY RESULTS
# =========================================================

def print_results(result):

    print()
    print("=" * 65)
    print("                     RESULTS")
    print("=" * 65)

    # -----------------------------------------------------
    # Exact duplicates
    # -----------------------------------------------------

    print()
    print(
        "EXACT DUPLICATE GROUPS"
    )

    print("-" * 65)

    if result["exact_duplicate_groups"]:

        for number, group in enumerate(
            result["exact_duplicate_groups"],
            start=1
        ):

            print(
                f"\nGroup {number}:"
            )

            for image in group:

                print(
                    f"  📷 {image.name}"
                )

    else:

        print(
            "No exact duplicate groups found."
        )

    # -----------------------------------------------------
    # Visual groups
    # -----------------------------------------------------

    print()
    print(
        "VISUALLY SIMILAR GROUPS"
    )

    print("-" * 65)

    if result["visual_groups"]:

        for number, group in enumerate(
            result["visual_groups"],
            start=1
        ):

            print(
                f"\nGroup {number}:"
            )

            for image in group:

                print(
                    f"  📷 {image.name}"
                )

    else:

        print(
            "No visually similar groups found."
        )

    # -----------------------------------------------------
    # Unique
    # -----------------------------------------------------

    print()
    print(
        "UNIQUE IMAGES"
    )

    print("-" * 65)

    if result["unique_images"]:

        for image in result["unique_images"]:

            print(
                f"  📷 {image.name}"
            )

    else:

        print(
            "No unique images."
        )

    # -----------------------------------------------------
    # Summary
    # -----------------------------------------------------

    print()
    print("=" * 65)
    print("                     SUMMARY")
    print("=" * 65)

    print(
        f"Total images      : "
        f"{result['total_images']}"
    )

    print(
        f"Processed         : "
        f"{result['processed_images']}"
    )

    print(
        f"Exact groups      : "
        f"{len(result['exact_duplicate_groups'])}"
    )

    print(
        f"Visual groups     : "
        f"{len(result['visual_groups'])}"
    )

    print(
        f"Unique images     : "
        f"{len(result['unique_images'])}"
    )

    print("=" * 65)


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    IMAGE_FOLDER = "test_images"

    try:

        result = analyze_images(
            IMAGE_FOLDER
        )

        print_results(
            result
        )

    except FileNotFoundError as error:

        print(
            f"❌ {error}"
        )

    except Exception as error:

        print(
            f"❌ Image analysis error: {error}"
        )