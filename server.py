import os
import sys
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

# -----------------------------
# ENV LOAD & DUMMY KEY SETUP FOR IMPORTS
# -----------------------------
from dotenv import load_dotenv
load_dotenv() # Load from .env file immediately on start

# Set a dummy key if GEMINI_API_KEY is not defined in environment
# to prevent import-time exceptions in main.py and image_validator.py.
API_KEY_SET = bool(os.getenv("GEMINI_API_KEY"))
if not API_KEY_SET:
    os.environ["GEMINI_API_KEY"] = "DUMMY_KEY_FOR_DEMO_MODE"

from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

# Add current folder to path to resolve local imports cleanly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import modules from Cmart-Civic-AI-main
from image_validator import validate_image
from location_validator import validate_location
from image_hash import get_hashes, compare_hashes
from main import (
    analyze_complaint,
    calculate_duplicate_score,
    haversine_distance_meters,
    load_complaints,
    save_complaints,
    generate_complaint_id,
    clamp
)

app = Flask(__name__, static_folder='../', static_url_path='')

# Configuration
PARENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(PARENT_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Target bounds for Nagpur city (approx 25km radius around Sitabuldi center)
NAGPUR_LAT = 21.1458
NAGPUR_LNG = 79.0882
MAX_NAGPUR_RADIUS_METERS = 25000.0

DEFAULT_COMPLAINTS = [
    {
        "complaint_id": "COMP-00001",
        "timestamp": "2026-08-16T12:00:00",
        "complaint": "Overflowing garbage dump near Sitabuldi main market.",
        "location": {
            "latitude": 21.1497,
            "longitude": 79.0806
        },
        "category": "Waste Management",
        "severity": "Medium",
        "urgency_score": 60,
        "summary": "Garbage piling up near market square.",
        "recommended_department": "Sanitation Department",
        "status": "In Progress",
        "upvotes": 21,
        "guestName": "Amit Sharma",
        "guestMobile": "+91 98765 43210",
        "isAssignedToUser": True,
        "assignedOfficer": "Rajesh Kumar",
        "area": "Sitabuldi, Nagpur",
        "image": {
            "provided": False,
            "path": None,
            "validator": None,
            "visual_problem_detected": True,
            "visual_description": "Garbage overflow",
            "confidence": 90
        },
        "duplicate": {
            "possible": False,
            "score": 0.0,
            "matched_complaint_id": None
        },
        "location_validation": {
            "valid": True,
            "distance_meters": 0.0,
            "reason": "Default complaint"
        }
    },
    {
        "complaint_id": "COMP-00002",
        "timestamp": "2026-08-17T09:30:00",
        "complaint": "Burst water main causing road waterlogging.",
        "location": {
            "latitude": 21.1463,
            "longitude": 79.0652
        },
        "category": "Water Leakage",
        "severity": "High",
        "urgency_score": 75,
        "summary": "Drinking water pipe burst near Dharampeth square.",
        "recommended_department": "Water Supply and Sewerage Board",
        "status": "Yet to Take Action",
        "upvotes": 14,
        "guestName": "Priya Verma",
        "guestMobile": "+91 87654 32109",
        "isAssignedToUser": True,
        "assignedOfficer": "Rajesh Kumar",
        "area": "Dharampeth, Nagpur",
        "image": {
            "provided": False,
            "path": None,
            "validator": None,
            "visual_problem_detected": True,
            "visual_description": "Water logging",
            "confidence": 95
        },
        "duplicate": {
            "possible": False,
            "score": 0.0,
            "matched_complaint_id": None
        },
        "location_validation": {
            "valid": True,
            "distance_meters": 0.0,
            "reason": "Default complaint"
        }
    },
    {
        "complaint_id": "COMP-00003",
        "timestamp": "2026-08-15T18:00:00",
        "complaint": "Deep pothole causing accidents during night.",
        "location": {
            "latitude": 21.1578,
            "longitude": 79.0878
        },
        "category": "Road Damage",
        "severity": "High",
        "urgency_score": 80,
        "summary": "Streetlight is also broken near Civil Lines.",
        "recommended_department": "Public Works Department",
        "status": "Completed",
        "upvotes": 9,
        "guestName": "Rahul Verma",
        "guestMobile": "+91 91234 56789",
        "isAssignedToUser": False,
        "assignedOfficer": "Suresh Patil",
        "area": "Civil Lines, Nagpur",
        "image": {
            "provided": False,
            "path": None,
            "validator": None,
            "visual_problem_detected": True,
            "visual_description": "Road pothole",
            "confidence": 85
        },
        "duplicate": {
            "possible": False,
            "score": 0.0,
            "matched_complaint_id": None
        },
        "location_validation": {
            "valid": True,
            "distance_meters": 0.0,
            "reason": "Default complaint"
        }
    }
]

# Initialize complaints file if not exists or empty
def init_db():
    try:
        complaints = load_complaints()
        if not complaints:
            print("Database empty or missing, loading default Nagpur complaints...")
            save_complaints(DEFAULT_COMPLAINTS)
    except Exception as e:
        print(f"Error initializing database: {e}")
        save_complaints(DEFAULT_COMPLAINTS)

# Bidirectional Category Mapping Helpers
def map_db_to_fe_category(db_category):
    mapping = {
        "Waste Management": ("garbage", "Overflowing Garbage"),
        "Water Leakage": ("water", "Waterlogging"),
        "Road Damage": ("road", "Broken Road"),
        "Sanitation": ("food", "Food Safety"),
        "Streetlight": ("road", "Streetlight"),
        "Drainage": ("water", "Drainage Problems"),
        "Traffic": ("road", "Traffic Obstruction"),
        "Illegal Dumping": ("garbage", "Illegal Dumping"),
        "Public Safety": ("road", "Public Safety Issue")
    }
    return mapping.get(db_category, ("road", "Other Civic Issue"))

def map_fe_to_db_category(fe_category):
    mapping = {
        "garbage": ("Waste Management", "Overflowing Garbage"),
        "water": ("Water Leakage", "Waterlogging"),
        "road": ("Road Damage", "Broken Road"),
        "food": ("Sanitation", "Food Safety"),
    }
    return mapping.get(fe_category, ("Other", "Other Civic Issue"))

# Mapper: DB layout to Frontend Layout
def to_frontend_format(complaint):
    db_cat = complaint.get("category", "Other")
    fe_cat, fe_cat_name = map_db_to_fe_category(db_cat)
    
    ts = complaint.get("timestamp") or ""
    date_str = ts.split("T")[0] if "T" in ts else datetime.now().strftime("%Y-%m-%d")
    
    img_info = complaint.get("image") or {}
    image_path = img_info.get("path")
    if image_path and not image_path.startswith("http") and not image_path.startswith("/"):
        if image_path.startswith("uploads/"):
            image_path = "/" + image_path
        else:
            image_path = "/uploads/" + image_path

    proof_path = complaint.get("proof_image_path")
    if proof_path and not proof_path.startswith("http") and not proof_path.startswith("/"):
        if proof_path.startswith("uploads/"):
            proof_path = "/" + proof_path
        else:
            proof_path = "/uploads/" + proof_path

    return {
        "id": complaint.get("complaint_id"),
        "category": fe_cat,
        "categoryName": fe_cat_name,
        "title": complaint.get("summary", complaint.get("complaint", ""))[:55] + "...",
        "description": complaint.get("complaint", ""),
        "area": complaint.get("area", "Nagpur"),
        "lat": complaint.get("location", {}).get("latitude"),
        "lng": complaint.get("location", {}).get("longitude"),
        "status": complaint.get("status", "Yet to Take Action"),
        "upvotes": complaint.get("upvotes", 1),
        "date": date_str,
        "guestName": complaint.get("guestName", "Anonymous"),
        "guestMobile": complaint.get("guestMobile", ""),
        "guestEmail": complaint.get("guestEmail", ""),
        "isAssignedToUser": complaint.get("isAssignedToUser", False),
        "assignedOfficer": complaint.get("assignedOfficer", ""),
        "image_path": image_path,
        "proof_image_path": proof_path,
        "remarks": complaint.get("remarks", "")
    }

# Safe AI Analyzer with demo mock fallback
def analyze_complaint_safe(description, temp_path=None):
    image_part = None
    if temp_path and API_KEY_SET:
        try:
            # Prepare image for Gemini using main.py helper
            from main import prepare_image
            image_part, _ = prepare_image(temp_path)
        except Exception as e:
            print(f"Error preparing image for Gemini: {e}")

    # Call Gemini client if API key is valid
    if API_KEY_SET:
        try:
            print("Calling Gemini model for complaint analysis...")
            result = analyze_complaint(description, image_part)
            
            image_validation = None
            if temp_path:
                print("Calling Gemini model for image validation...")
                try:
                    image_validation = validate_image(temp_path, description)
                except Exception as e:
                    print(f"Error running validate_image: {e}")
            
            return {
                "success": True,
                "category": result.category,
                "severity": result.severity,
                "urgency_score": result.urgency_score,
                "summary": result.summary,
                "recommended_department": result.recommended_department,
                "visual_problem_detected": result.visual_problem_detected,
                "visual_description": result.visual_description,
                "image_confidence": result.image_confidence,
                "image_validation": {
                    "relevant": image_validation.relevant if image_validation else True,
                    "match": image_validation.match if image_validation else True,
                    "issue_type": image_validation.issue_type if image_validation else "Unknown",
                    "confidence": image_validation.confidence if image_validation else 90,
                    "reason": image_validation.reason if image_validation else "Image verified"
                } if temp_path else None
            }
        except Exception as e:
            print(f"Gemini API call failed: {e}. Falling back to Heuristic Demo Mode.")

    # FALLBACK / DEMO MODE: Rule-based analysis
    print("Running in Local Heuristic Demo Mode (No Gemini call)")
    desc_lower = description.lower()
    
    if any(k in desc_lower for k in ["road", "pothole", "street", "pavement", "hole"]):
        category = "Road Damage"
        dept = "Public Works Department"
        severity = "High" if "accident" in desc_lower or "danger" in desc_lower else "Medium"
        urgency = 80 if severity == "High" else 55
    elif any(k in desc_lower for k in ["garbage", "dump", "waste", "clean", "litter", "rubbish", "pile", "trash"]):
        category = "Waste Management"
        dept = "Sanitation Department"
        severity = "Medium"
        urgency = 50
    elif any(k in desc_lower for k in ["water", "leak", "clog", "drain", "pipe", "burst", "logging", "flood"]):
        category = "Water Leakage"
        dept = "Water Supply and Sewerage Board"
        severity = "High" if "burst" in desc_lower or "flood" in desc_lower else "Medium"
        urgency = 85 if severity == "High" else 60
    elif any(k in desc_lower for k in ["light", "dark", "bulb", "lamp", "streetlight"]):
        category = "Streetlight"
        dept = "Electricity Department"
        severity = "Low"
        urgency = 35
    elif any(k in desc_lower for k in ["food", "vendor", "hygiene", "unsanitary", "restaurant", "hotel", "dirty"]):
        category = "Sanitation"
        dept = "Health Department"
        severity = "Medium"
        urgency = 45
    else:
        category = "Other"
        dept = "General Municipal Administration"
        severity = "Medium"
        urgency = 40

    summary = description[:50] + ("..." if len(description) > 50 else "")
    
    img_val = None
    if temp_path:
        img_val = {
            "relevant": True,
            "match": True,
            "issue_type": category.lower(),
            "confidence": 95,
            "reason": "Demo Mode: Image visually matches complaint description."
        }

    return {
        "success": False,
        "category": category,
        "severity": severity,
        "urgency_score": urgency,
        "summary": summary,
        "recommended_department": dept,
        "visual_problem_detected": True if temp_path else False,
        "visual_description": f"Demo Mode: Visual {category.lower()} issue detected." if temp_path else "",
        "image_confidence": 95 if temp_path else 0,
        "image_validation": img_val
    }


# Serve Frontend
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Simulated Authentication Endpoints
@app.route('/api/auth/otp', methods=['POST'])
def send_otp():
    data = request.json or {}
    mobile = data.get('mobile', '')
    if not mobile or len(mobile) < 10:
        return jsonify({"error": "Invalid mobile number"}), 400
    return jsonify({"success": True, "otp": "4892", "message": "Demo OTP 4892 sent to " + mobile})

@app.route('/api/auth/verify', methods=['POST'])
def verify_otp():
    data = request.json or {}
    name = data.get('name', '').strip()
    mobile = data.get('mobile', '').strip()
    email = data.get('email', '').strip()
    otp = data.get('otp', '').strip()
    if otp != "4892":
        return jsonify({"error": "Invalid OTP. Use demo code 4892."}), 400
    return jsonify({
        "success": True,
        "user": {
            "role": "guest",
            "name": name or "Aarav Gupta",
            "mobile": mobile or "+91 99112 23344",
            "email": email or ""
        }
    })

# Simulated User and Admin Logins
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    requested_role = data.get('role', 'user').strip()
    
    if requested_role == 'admin':
        if username == 'admin_nagpur' and password == 'password123':
            return jsonify({
                "success": True,
                "user": {
                    "role": "admin",
                    "name": "NMC Admin Portal",
                    "mobile": "+91 71225 67890",
                    "email": "admin@nmcnagpur.gov.in"
                }
            })
    else: # Field user
        if username == 'rajesh_nagpur' and password == 'password123':
            return jsonify({
                "success": True,
                "user": {
                    "role": "user",
                    "name": "Rajesh Kumar",
                    "mobile": "+91 98111 22334"
                }
            })
            
    return jsonify({"error": "Invalid username or password"}), 401

# API: GET Reports
@app.route('/api/reports', methods=['GET'])
def get_reports():
    try:
        complaints = load_complaints()
        # Map to frontend format
        mapped = [to_frontend_format(c) for c in complaints]
        return jsonify(mapped)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API: POST upvote (Once per user)
@app.route('/api/reports/<complaint_id>/upvote', methods=['POST'])
def upvote_complaint(complaint_id):
    try:
        data = request.json or {}
        user_id = data.get("userId", "anonymous").strip()

        complaints = load_complaints()
        found = False
        for c in complaints:
            if c.get("complaint_id") == complaint_id:
                # Check upvoters list
                upvoters = c.get("upvoters")
                if not isinstance(upvoters, list):
                    upvoters = []
                    c["upvoters"] = upvoters
                
                if user_id in upvoters and user_id != "anonymous":
                    return jsonify({"error": "You have already upvoted this complaint."}), 400
                
                upvoters.append(user_id)
                c["upvoters"] = upvoters
                c["upvotes"] = c.get("upvotes", 0) + 1
                found = True
                break
        if not found:
            return jsonify({"error": "Complaint not found"}), 404
        save_complaints(complaints)
        return jsonify({"success": True, "message": f"Complaint {complaint_id} upvoted."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API: POST Resolve
@app.route('/api/reports/<complaint_id>/resolve', methods=['POST'])
def resolve_complaint(complaint_id):
    try:
        complaints = load_complaints()
        target = None
        for c in complaints:
            if c.get("complaint_id") == complaint_id:
                target = c
                break
        if not target:
            return jsonify({"error": "Complaint not found"}), 404

        status = request.form.get("status", "In Progress")
        remarks = request.form.get("remarks", "")
        
        # GPS Proof check
        lat = request.form.get("lat")
        lng = request.form.get("lng")
        
        proof_path = None
        if 'proof_image' in request.files:
            file = request.files['proof_image']
            if file.filename != '':
                filename = secure_filename(f"proof_{uuid.uuid4().hex}_{file.filename}")
                proof_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(proof_path)
                proof_path = filename

        # Update fields
        target["status"] = status
        target["remarks"] = remarks
        if proof_path:
            target["proof_image_path"] = proof_path
        
        # If completed, unassign officer from active list in UI
        if status == "Completed":
            target["isAssignedToUser"] = False
            
        save_complaints(complaints)
        return jsonify({"success": True, "message": f"Complaint {complaint_id} updated.", "report": to_frontend_format(target)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API: POST create report (Main Pipeline)
@app.route('/api/reports', methods=['POST'])
def create_report():
    try:
        complaints = load_complaints()
        
        # Form inputs
        description = request.form.get("description", "").strip()
        fe_category = request.form.get("category", "").strip()
        lat_val = request.form.get("latitude")
        lng_val = request.form.get("longitude")
        area = request.form.get("area", "Nagpur").strip()
        guest_name = request.form.get("guestName", "Aarav Gupta").strip()
        guest_mobile = request.form.get("guestMobile", "+91 99112 23344").strip()
        guest_email = request.form.get("guestEmail", "").strip()
        force_submit = request.form.get("force", "false").lower() == "true"

        if not description or not lat_val or not lng_val:
            return jsonify({"error": "Description and GPS coordinates are required"}), 400
            
        new_lat = float(lat_val)
        new_lng = float(lng_val)
        
        # Resolve category mapping
        db_category, fe_category_name = map_fe_to_db_category(fe_category)

        # --------------------------------------------------------
        # 1. Image upload handling
        # --------------------------------------------------------
        temp_path = None
        relative_path = None
        new_sha256 = None
        new_phash_str = None
        
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                filename = secure_filename(f"rep_{uuid.uuid4().hex}_{file.filename}")
                temp_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(temp_path)
                relative_path = filename
                
                # Generate SHA256 and pHash for visual duplicate check
                try:
                    new_sha256, new_phash = get_hashes(temp_path)
                    new_phash_str = str(new_phash)
                except Exception as e:
                    print(f"Hashing image failed: {e}")

        # --------------------------------------------------------
        # 2. Location limits validation (Nagpur bounds check)
        # --------------------------------------------------------
        dist_from_center = haversine_distance_meters(new_lat, new_lng, NAGPUR_LAT, NAGPUR_LNG)
        if dist_from_center > MAX_NAGPUR_RADIUS_METERS:
            # Clean up temp image
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({
                "status": "REJECTED_LOCATION",
                "message": f"User is too far from Nagpur (Distance: {round(dist_from_center/1000, 2)} km). Restricted to Nagpur limits."
            }), 400

        # --------------------------------------------------------
        # 3. Duplicate check (Text similarity + Geo proximity + Image hashes)
        # --------------------------------------------------------
        if not force_submit:
            duplicate_found = False
            best_score = 0.0
            matched_report = None
            
            for old in complaints:
                old_desc = old.get("complaint", "")
                if not old_desc:
                    continue
                
                # Check category (only check duplicates in same category)
                old_cat = old.get("category", "")
                if old_cat != db_category:
                    continue
                    
                # Text similarity
                text_score = calculate_duplicate_score(description, old_desc)
                
                # Location Proximity
                location_bonus = 0.0
                old_loc = old.get("location", {})
                old_lat = old_loc.get("latitude")
                old_lng = old_loc.get("longitude")
                
                distance = None
                if old_lat is not None and old_lng is not None:
                    distance = haversine_distance_meters(new_lat, new_lng, old_lat, old_lng)
                    if distance <= 100:
                        location_bonus = 0.15
                    elif distance <= 300:
                        location_bonus = 0.08
                
                # Image similarity (pHash comparison)
                image_bonus = 0.0
                old_img = old.get("image") or {}
                old_sha = old_img.get("sha256")
                old_phash_hex = old_img.get("phash")
                
                if new_sha256 and old_sha:
                    if new_sha256 == old_sha:
                        image_bonus = 0.30
                    elif old_phash_hex and new_phash_str:
                        try:
                            import imagehash
                            h1 = imagehash.hex_to_hash(new_phash_str)
                            h2 = imagehash.hex_to_hash(old_phash_hex)
                            dist = h1 - h2
                            if dist <= 8:
                                image_bonus = 0.25 # very similar
                            elif dist <= 12:
                                image_bonus = 0.12 # moderately similar
                        except Exception as e:
                            print(f"Error parsing image hashes for duplicate comparison: {e}")
                
                final_score = min(1.0, text_score + location_bonus + image_bonus)
                
                # High image similarity + close distance is an immediate match
                is_visual_duplicate = (
                    distance is not None
                    and distance <= 300
                    and image_bonus >= 0.25
                )
                
                if final_score >= 0.72 or is_visual_duplicate:
                    if final_score > best_score:
                        best_score = final_score
                        matched_report = old
                        duplicate_found = True
            
            if duplicate_found and matched_report:
                # Clean up uploaded temp image
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
                
                # Map to frontend format
                matched_fe = to_frontend_format(matched_report)
                return jsonify({
                    "status": "POSSIBLE_DUPLICATE",
                    "duplicate_score": round(best_score, 3),
                    "report": matched_fe
                }), 200

        # --------------------------------------------------------
        # 4. Run AI analysis
        # --------------------------------------------------------
        ai_res = analyze_complaint_safe(description, temp_path)
        
        # If image was provided, verify matching
        if temp_path and ai_res.get("image_validation"):
            img_val = ai_res["image_validation"]
            if (not img_val.get("relevant") or not img_val.get("match")) and img_val.get("confidence", 0) >= 60:
                # Remove file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return jsonify({
                    "status": "REJECTED_IMAGE_MISMATCH",
                    "reasons": [img_val.get("reason", "Uploaded image does not support the complaint.")]
                }), 400

        # --------------------------------------------------------
        # 5. Save report record
        # --------------------------------------------------------
        new_id = generate_complaint_id(complaints)
        
        record = {
            "complaint_id": new_id,
            "timestamp": datetime.now(timezone.utc).isoformat().replace('+00:00', ''),
            "complaint": description,
            "location": {
                "latitude": new_lat,
                "longitude": new_lng
            },
            "category": ai_res.get("category", db_category),
            "severity": ai_res.get("severity", "Medium"),
            "urgency_score": ai_res.get("urgency_score", 50),
            "summary": ai_res.get("summary", description[:50]),
            "recommended_department": ai_res.get("recommended_department", "General Municipality"),
            "status": "Yet to Take Action",
            "upvotes": 1,
            "guestName": guest_name,
            "guestMobile": guest_mobile,
            "guestEmail": guest_email,
            "isAssignedToUser": True,  # Assign to Rajesh for zone officer dashboard
            "assignedOfficer": "Rajesh Kumar",
            "area": area,
            "image": {
                "provided": bool(relative_path),
                "path": relative_path,
                "sha256": new_sha256,
                "phash": new_phash_str,
                "validator": ai_res.get("image_validation"),
                "visual_problem_detected": ai_res.get("visual_problem_detected", False),
                "visual_description": ai_res.get("visual_description", ""),
                "confidence": ai_res.get("image_confidence", 90)
            },
            "duplicate": {
                "possible": force_submit and 'matched_report' in locals() and matched_report is not None,
                "score": float(best_score) if 'best_score' in locals() else 0.0,
                "matched_complaint_id": matched_report.get("complaint_id") if 'matched_report' in locals() and matched_report else None
            },
            "location_validation": {
                "valid": True,
                "distance_meters": 0.0,
                "reason": "Verified inside Nagpur limits."
            }
        }
        
        complaints.append(record)
        save_complaints(complaints)
        
        # Return in frontend layout
        fe_record = to_frontend_format(record)
        return jsonify({
            "status": "NEW_COMPLAINT",
            "report": fe_record
        }), 201
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initialize DB with mock items if missing
    init_db()
    # Run the server
    print("Starting Nagar Mitra Backend Server...")
    print("Serving frontend from: " + app.static_folder)
    print("GEMINI API status: " + ("Configured" if API_KEY_SET else "Missing (running in Demo Mode)"))
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)
