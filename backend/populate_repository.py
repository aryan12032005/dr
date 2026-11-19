import os
import re
import sys
import zipfile
import shutil
from pathlib import Path
from bson import ObjectId
from pymongo import MongoClient, UpdateOne
import dotenv

# Load environment variables
env_path = Path(__file__).resolve().parent / '.env'
dotenv.load_dotenv(env_path)

db_string = os.getenv("DATABASE_STRING")
if not db_string:
    print("ERROR: DATABASE_STRING not found in .env")
    sys.exit(1)

print(f"Connecting to MongoDB Atlas...")
client = MongoClient(db_string)
db = client['Library']
print("Connected successfully!")

# Define categories
CATEGORIES = [
    {"code": "(QB06)", "name": "Question Bank"},
    {"code": "Book010", "name": "Books"},
    {"code": "(SS04)", "name": "Short Synopsis"},
    {"code": "PR01", "name": "Project Reports"},
    {"code": "(PJ08)", "name": "Periodicals & Journals"},
    {"code": "D02", "name": "Dissertations"},
    {"code": "(LS05)", "name": "Long Synopsis"},
    {"code": "proj_report", "name": "Project Reports (General)"},
    {"code": "other", "name": "Other Documents"},
    {"code": "book", "name": "Books (General)"},
    {"code": "RESEARCH", "name": "Research Papers"},
    {"code": "REPORTS", "name": "Project Reports"}
]

# Define departments with subject mappings
DEPARTMENTS = [
    {
        "dep_code": "CSE",
        "dep_name": "Computer Science & Engineering",
        "managers": [],
        "subjects": {
            "CORE": ["Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Database Management", "Software Engineering"],
            "REPORTS": ["Final Year Project", "Internship Report", "Mini Project"],
            "SYNOPSIS": ["Short Synopsis", "Long Synopsis"],
            "QB": ["Question Paper"],
            "ACADEMIC": ["Textbook", "Journal"]
        }
    },
    {
        "dep_code": "ECE",
        "dep_name": "Electronics & Communication Engineering",
        "managers": [],
        "subjects": {
            "CORE": ["BOEE", "Digital Electronics", "Signals & Systems", "Microprocessors", "Communication Systems", "VLSI"],
            "REPORTS": ["Project Report", "Internship Report"],
            "SYNOPSIS": ["Short Synopsis", "Long Synopsis"],
            "QB": ["Question Paper"],
            "ACADEMIC": ["Textbook", "Journal"]
        }
    },
    {
        "dep_code": "ME",
        "dep_name": "Mechanical Engineering",
        "managers": [],
        "subjects": {
            "CORE": ["Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing Processes", "Kinematics"],
            "REPORTS": ["Project Report", "Internship Report"],
            "SYNOPSIS": ["Short Synopsis", "Long Synopsis"],
            "QB": ["Question Paper"],
            "ACADEMIC": ["Textbook", "Journal"]
        }
    },
    {
        "dep_code": "SCI",
        "dep_name": "School of Sciences",
        "managers": [],
        "subjects": {
            "CHEM": ["Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"],
            "PHY": ["Physics", "Modern Physics", "Optics"],
            "MATH": ["Mathematics", "Applied Mathematics", "Discrete Mathematics"],
            "REPORTS": ["Project Report", "Internship Report"],
            "SYNOPSIS": ["Short Synopsis", "Long Synopsis"],
            "QB": ["Question Paper"],
            "ACADEMIC": ["Textbook", "Journal"]
        }
    },
    {
        "dep_code": "HUM",
        "dep_name": "School of Education & Humanities",
        "managers": [],
        "subjects": {
            "CORE": ["Education", "English Literature", "Psychology", "Sociology", "Communication Skills"],
            "REPORTS": ["Project Report", "Internship Report"],
            "SYNOPSIS": ["Short Synopsis", "Long Synopsis"],
            "QB": ["Question Paper"],
            "ACADEMIC": ["Textbook", "Journal"]
        }
    },
    {
        "dep_code": "LLB-01",
        "dep_name": "School of Law",
        "managers": [],
        "subjects": {
            "CORE": ["Constitutional Law", "Criminal Law", "Corporate Law", "Jurisprudence", "International Law"],
            "DISSERTATION": ["LLM Dissertation", "Dissertation"],
            "REPORTS": ["Law", "Internship Report", "Legal Aid Report"],
            "SYNOPSIS": ["Short Synopsis", "Long Synopsis"],
            "QB": ["Question Paper"],
            "ACADEMIC": ["Textbook", "Journal"]
        }
    },
    {
        "dep_code": "BBA-01",
        "dep_name": "School of Management & Commerce",
        "managers": [],
        "subjects": {
            "CORE": ["Marketing Management", "Financial Accounting", "Human Resource Management", "Business Analytics", "Economics"],
            "REPORTS": ["English", "Internship Report", "Business Plan Report"],
            "SYNOPSIS": ["Short Synopsis", "Long Synopsis"],
            "QB": ["Question Paper"],
            "ACADEMIC": ["Textbook", "Journal"]
        }
    },
    {
        "dep_code": "GEN",
        "dep_name": "General & Interdisciplinary",
        "managers": [],
        "subjects": {
            "CORE": ["Interdisciplinary", "General Studies", "Environmental Studies"],
            "REPORTS": ["Project Report", "General Report"],
            "SYNOPSIS": ["Short Synopsis", "Long Synopsis"],
            "QB": ["Question Paper"],
            "ACADEMIC": ["Textbook", "Journal"]
        }
    }
]

def populate_categories_and_departments():
    print("\n--- Populating Categories ---")
    cat_coll = db['categories']
    for cat in CATEGORIES:
        res = cat_coll.update_one(
            {"code": cat["code"]},
            {"$set": {"name": cat["name"], "code": cat["code"], "updatedAt": "2026-11-19T03:30:00.000Z"}},
            upsert=True
        )
        print(f"  Category '{cat['code']}' ({cat['name']}): {'matched/updated' if res.matched_count else 'created'}")

    print("\n--- Populating Departments & Subjects ---")
    dep_coll = db['departments']
    for dep in DEPARTMENTS:
        res = dep_coll.update_one(
            {"dep_code": dep["dep_code"]},
            {"$set": {
                "dep_name": dep["dep_name"],
                "dep_code": dep["dep_code"],
                "managers": dep.get("managers", []),
                "subjects": dep.get("subjects", {}),
                "updatedAt": "2026-11-19T03:30:00.000Z"
            }},
            upsert=True
        )
        print(f"  Department '{dep['dep_code']}' ({dep['dep_name']}): {'matched/updated' if res.matched_count else 'created'}")

def clean_title(fname):
    name = re.sub(r'^\d+_', '', fname)
    name = re.sub(r'\.(pdf|docx|doc|zip|jpeg|jpg|png)$', '', name, flags=re.I)
    name = re.sub(r'\.(pdf|docx|doc)$', '', name, flags=re.I)
    name = name.replace('_', ' ').strip()
    return name

def infer_metadata(category, fname):
    title = clean_title(fname)
    t_upper = title.upper()
    cat_upper = category.upper()

    # Department detection
    if any(k in t_upper for k in ['CSE', 'CSUN', 'COMPUTER SCIENCE', 'SOFTWARE', 'ADA ']):
        dept = 'CSE'
    elif any(k in t_upper for k in ['ECE', 'ELECTRONIC', 'COMMUNICATION']):
        dept = 'ECE'
    elif any(k in t_upper for k in [' ME ', 'ME)', '(ME', 'MECHANICAL']):
        dept = 'ME'
    elif any(k in t_upper for k in ['CHEMISTRY', 'CHEM']):
        dept = 'SCI'
    elif any(k in t_upper for k in ['SCIENCES', 'SCIENCE', 'PHYSICS', 'MATH']):
        dept = 'SCI'
    elif any(k in t_upper for k in ['LAW', 'LLM', 'LLB', 'LEGAL']):
        dept = 'LLB-01'
    elif any(k in t_upper for k in ['BBA', 'MBA', 'MGT', 'MANAGEMENT', 'COMMERCE']):
        dept = 'BBA-01'
    elif any(k in t_upper for k in ['HUMANITIES', 'EDU', 'EDUCATION', 'SOCIAL SCIENCE']):
        dept = 'HUM'
    else:
        dept = 'GEN'

    # Subject detection
    if 'QB' in cat_upper or 'QUESTION' in t_upper:
        subj = 'Question Paper'
    elif 'D02' in cat_upper or 'DISSERTATION' in t_upper:
        subj = 'Dissertation'
    elif 'PR' in cat_upper or 'INTERNSHIP' in t_upper or 'PROJECT' in t_upper:
        subj = 'Project Report'
    elif 'SS' in cat_upper or 'SHOT SYNOPSIS' in t_upper or 'SHORT SYNOPSIS' in t_upper:
        subj = 'Short Synopsis'
    elif 'LS' in cat_upper or 'LONG SYNOPSIS' in t_upper:
        subj = 'Long Synopsis'
    elif 'BOOK' in cat_upper:
        subj = 'Textbook'
    elif 'PJ' in cat_upper or 'JOURNAL' in t_upper:
        subj = 'Journal'
    else:
        subj = 'General'

    # Author detection
    author = "Faculty / Student"
    m_syn = re.search(r'(?:Synopsis|Report|Dissertation)[\s_-]+([A-Za-z\s]+)', title, re.I)
    if m_syn and len(m_syn.group(1).strip()) > 3:
        author = m_syn.group(1).strip()
    elif 'Supriya Prathapan' in title:
        author = 'Supriya Prathapan'
    elif 'Divya' in title:
        author = 'Divya'
    elif 'Rakhi' in title:
        author = 'Rakhi'
    elif 'Mansi Shukla' in title:
        author = 'Mansi Shukla'
    elif 'Aman Kumar' in title.upper() or 'AMAN _KUMAR' in fname.upper():
        author = 'Aman Kumar'
    elif 'Sumit Yadav' in title:
        author = 'Sumit Yadav'
    elif 'SeshuKumar' in title:
        author = 'Seshu Kumar Pilla'
    elif 'Sakshi Sharma' in title.upper():
        author = 'Sakshi Sharma'
    elif 'Khushi Sharma' in title.upper():
        author = 'Khushi Sharma'
    elif 'Neha Gupta' in title.upper():
        author = 'Neha Gupta'
    elif 'Vijeyta Hira' in title:
        author = 'Vijeyta Hira'

    return title, dept, subj, author

def extract_and_import_documents():
    dest_files_dir = Path(__file__).resolve().parent / 'FILES'
    dest_files_dir.mkdir(parents=True, exist_ok=True)
    print(f"\nTarget FILES directory: {dest_files_dir}")

    # Find admin user for owner
    admin_user = db['users'].find_one({"is_admin": True})
    owner_id = admin_user['_id'] if admin_user else ObjectId()
    print(f"Using owner ID: {owner_id} ({admin_user.get('username') if admin_user else 'Default'})")

    downloads_dir = Path(r"C:\Users\aryan\Downloads")
    zip_files = sorted(downloads_dir.glob("FILES*.zip"))
    print(f"Found {len(zip_files)} zip archives: {[z.name for z in zip_files]}")

    docs_metadata = {}

    for zp in zip_files:
        print(f"\nProcessing {zp.name}...")
        with zipfile.ZipFile(zp, 'r') as z:
            members = z.namelist()
            print(f"  Archive contains {len(members)} entries. Extracting...")
            
            for m in members:
                parts = m.split('/')
                # Expected format: FILES/<category>/<doc_id>/<cover|document>/<filename>
                if len(parts) >= 5 and parts[4]:
                    cat = parts[1]
                    doc_id = parts[2]
                    dtype = parts[3] # 'cover' or 'document'
                    fname = parts[4]

                    # Destination path
                    target_dir = dest_files_dir / cat / doc_id / dtype
                    target_dir.mkdir(parents=True, exist_ok=True)
                    target_file = target_dir / fname

                    if not target_file.exists():
                        with z.open(m) as src, open(target_file, 'wb') as dst:
                            shutil.copyfileobj(src, dst)

                    if doc_id not in docs_metadata:
                        docs_metadata[doc_id] = {
                            'id': doc_id,
                            'category': cat,
                            'files': {},
                            'primary_file': fname
                        }
                    docs_metadata[doc_id]['files'][dtype] = fname
                    if dtype == 'document':
                        docs_metadata[doc_id]['primary_file'] = fname

    print(f"\nTotal documents extracted & indexed: {len(docs_metadata)}")

    # Bulk update to MongoDB documents collection
    doc_coll = db['documents']
    operations = []

    for doc_id, item in docs_metadata.items():
        fname = item['primary_file']
        title, dept, subj, author = infer_metadata(item['category'], fname)
        has_cover = 'cover' in item['files']

        doc_data = {
            "title": title,
            "docType": "pdf",
            "coverType": "file" if has_cover else "",
            "coverLink": "",
            "cover_path": "",
            "documentLink": "",
            "document_path": "",
            "isPublic": "true",
            "owner": owner_id,
            "comments": [],
            "allowed_users": [],
            "createDate": "2026-11-19T03:30:00.000Z",
            "category": item['category'],
            "department": dept,
            "subject": subj,
            "authors": author,
            "accessionNumber": "",
            "updatedAt": "2026-11-19T03:30:00.000Z"
        }

        try:
            oid = ObjectId(doc_id)
        except Exception:
            oid = ObjectId()

        operations.append(
            UpdateOne(
                {"_id": oid},
                {
                    "$set": doc_data,
                    "$setOnInsert": {"createdAt": "2026-11-19T03:30:00.000Z"}
                },
                upsert=True
            )
        )

    if operations:
        print(f"Writing {len(operations)} document records to MongoDB Atlas...")
        res = doc_coll.bulk_write(operations)
        print(f"MongoDB write complete: {res.upserted_count} inserted, {res.modified_count} updated, {res.matched_count} matched.")

if __name__ == '__main__':
    populate_categories_and_departments()
    extract_and_import_documents()
    print("\nSUCCESS: All categories, departments, subjects, and documents populated successfully!")
