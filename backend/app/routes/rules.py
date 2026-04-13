from fastapi import APIRouter
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../..'))
from src.pipeline import STG_RULES

router = APIRouter()

@router.get("/stg-rules")
async def get_stg_rules():
    """Get all Standard Treatment Guidelines rules."""
    rules_data = {}
    for category, packages in STG_RULES.items():
        rules_data[category] = {}
        for package_code, rules in packages.items():
            rules_data[category][package_code] = {
                "max_los": rules["max_los"],
                "min_procedures": rules["min_procedures"],
                "required_docs": rules["required_docs"],
            }
    return {"rules": rules_data}

@router.get("/categories")
async def get_categories():
    """Get all rule categories."""
    return {"categories": list(STG_RULES.keys())}

@router.get("/packages/{category}")
async def get_packages_by_category(category: str):
    """Get packages for a specific category."""
    if category not in STG_RULES:
        return {"error": "Category not found"}, 404
    
    packages = []
    for package_code, rules in STG_RULES[category].items():
        packages.append({
            "code": package_code,
            "max_los": rules["max_los"],
            "required_docs": rules["required_docs"],
        })
    return {"packages": packages, "category": category}
