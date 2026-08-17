from __future__ import annotations

from dataclasses import dataclass
from math import radians, sin, cos, sqrt, atan2
from typing import Optional


# =========================================================
# CONFIGURATION
# =========================================================

EARTH_RADIUS_METERS = 6_371_000

# Normal GPS tolerance.
DEFAULT_MAX_DISTANCE_METERS = 500

# If user's GPS accuracy is worse than this, location is
# considered too unreliable.
MAX_ACCEPTABLE_ACCURACY_METERS = 200


# =========================================================
# RESULT
# =========================================================

@dataclass(frozen=True)
class LocationValidation:
    valid: bool
    distance_meters: Optional[float]
    reason: str


# =========================================================
# VALIDATION
# =========================================================

def _validate_coordinates(
    latitude: float,
    longitude: float,
) -> None:

    if not (-90 <= latitude <= 90):
        raise ValueError(
            f"Invalid latitude: {latitude}"
        )

    if not (-180 <= longitude <= 180):
        raise ValueError(
            f"Invalid longitude: {longitude}"
        )


# =========================================================
# HAVERSINE DISTANCE
# =========================================================

def calculate_distance_meters(
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float,
) -> float:

    _validate_coordinates(latitude1, longitude1)
    _validate_coordinates(latitude2, longitude2)

    lat1 = radians(latitude1)
    lat2 = radians(latitude2)

    delta_lat = radians(latitude2 - latitude1)
    delta_lon = radians(longitude2 - longitude1)

    a = (
        sin(delta_lat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(delta_lon / 2) ** 2
    )

    # Protect against tiny floating-point errors.
    a = min(1.0, max(0.0, a))

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return EARTH_RADIUS_METERS * c


# =========================================================
# LOCATION MATCH
# =========================================================

def validate_location(
    user_latitude: float,
    user_longitude: float,
    complaint_latitude: float,
    complaint_longitude: float,
    gps_accuracy_meters: Optional[float] = None,
    max_distance_meters: float = DEFAULT_MAX_DISTANCE_METERS,
) -> LocationValidation:

    # -----------------------------------------------------
    # Coordinate validation
    # -----------------------------------------------------

    try:

        _validate_coordinates(
            user_latitude,
            user_longitude
        )

        _validate_coordinates(
            complaint_latitude,
            complaint_longitude
        )

    except ValueError as error:

        return LocationValidation(
            valid=False,
            distance_meters=None,
            reason=str(error)
        )

    # -----------------------------------------------------
    # Configuration validation
    # -----------------------------------------------------

    if max_distance_meters <= 0:

        return LocationValidation(
            valid=False,
            distance_meters=None,
            reason="Invalid maximum distance."
        )

    # -----------------------------------------------------
    # GPS accuracy validation
    # -----------------------------------------------------

    if gps_accuracy_meters is not None:

        if gps_accuracy_meters < 0:

            return LocationValidation(
                valid=False,
                distance_meters=None,
                reason="Invalid GPS accuracy."
            )

        if gps_accuracy_meters > MAX_ACCEPTABLE_ACCURACY_METERS:

            return LocationValidation(
                valid=False,
                distance_meters=None,
                reason=(
                    "GPS accuracy is too low for reliable "
                    "location verification."
                )
            )

    # -----------------------------------------------------
    # Distance calculation
    # -----------------------------------------------------

    distance = calculate_distance_meters(
        user_latitude,
        user_longitude,
        complaint_latitude,
        complaint_longitude,
    )

    # -----------------------------------------------------
    # Dynamic tolerance
    # -----------------------------------------------------

    # If GPS reports an accuracy radius, allow that
    # uncertainty in addition to the normal threshold.
    effective_distance = max_distance_meters

    if gps_accuracy_meters is not None:

        effective_distance += gps_accuracy_meters

    # -----------------------------------------------------
    # Final decision
    # -----------------------------------------------------

    if distance <= effective_distance:

        return LocationValidation(
            valid=True,
            distance_meters=round(distance, 2),
            reason=(
                "User location is within the acceptable "
                "distance of the complaint location."
            )
        )

    return LocationValidation(
        valid=False,
        distance_meters=round(distance, 2),
        reason=(
            "User location is too far from the "
            "complaint location."
        )
    )


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    # Example user GPS
    user_latitude = 28.6139
    user_longitude = 77.2090

    # Example complaint location
    complaint_latitude = 19.0760
    complaint_longitude = 72.8777

    # Accuracy reported by the user's GPS
    gps_accuracy_meters = 20

    result = validate_location(
        user_latitude=user_latitude,
        user_longitude=user_longitude,
        complaint_latitude=complaint_latitude,
        complaint_longitude=complaint_longitude,
        gps_accuracy_meters=gps_accuracy_meters,
    )

    print("=" * 55)
    print("             LOCATION VALIDATION")
    print("=" * 55)

    print(f"Valid: {result.valid}")
    print(f"Distance: {result.distance_meters} meters")
    print(f"Reason: {result.reason}")

    print("=" * 55)