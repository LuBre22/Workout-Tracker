import csv
from typing import List, Dict, Any

def read_csv(filepath: str) -> List[Dict[str, Any]]:
    """Read all rows from a CSV file and return as a list of dictionaries."""
    with open(filepath, mode='r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def dump_csv(filepath: str, data: List[Dict[str, Any]], fieldnames: List[str]) -> None:
    """
    Write a list of dictionaries to a CSV file.

    Example:
        data = [
            {"Username": "alice", "Password": "password123", "E-Mail": "alice@example.com"},
            {"Username": "bob", "Password": "securepass", "E-Mail": "bob@example.com"}
        ]
        fieldnames = ["Username", "Password", "E-Mail"]
        dump_csv("Backend/UserManagement/Users.csv", data, fieldnames)
    """
    with open(filepath, mode='w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def update_csv(filepath: str, match_field: str, match_value: Any, update_data: Dict[str, Any]) -> bool:
    """
    Update the first row in the CSV where match_field == match_value.
    Returns True if a row was updated, False otherwise.
    """
    rows = read_csv(filepath)
    updated = False
    for row in rows:
        if row.get(match_field) == str(match_value):
            row.update(update_data)
            updated = True
            break
    if updated and rows:
        dump_csv(filepath, rows, fieldnames=list(rows[0].keys()))
    return updated