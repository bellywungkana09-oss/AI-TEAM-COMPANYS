"""Read-only floor state for the virtual office. Does not create employees."""

ROOMS = [
    {"id": "ceo", "name": "CEO Room", "x": 0, "z": -16.4, "w": 11, "d": 8, "doors": ["s"], "accent": "gold"},
    {"id": "technology", "name": "Technology", "x": -13.6, "z": -6.4, "w": 8.6, "d": 7.4, "doors": ["e"], "accent": "blue"},
    {"id": "product", "name": "Product", "x": 13.6, "z": -6.4, "w": 8.6, "d": 7.4, "doors": ["w"], "accent": "blue"},
    {"id": "design", "name": "Design", "x": -13.6, "z": 8.6, "w": 8.6, "d": 7.4, "doors": ["e"], "accent": "gold"},
    {"id": "development", "name": "Development", "x": 13.6, "z": 8.6, "w": 8.6, "d": 7.4, "doors": ["w"], "accent": "blue"},
    {"id": "qa", "name": "Quality Assurance", "x": 0, "z": 16.4, "w": 11, "d": 7.2, "doors": ["n"], "accent": "blue"},
    {"id": "meeting", "name": "Meeting Room", "x": 0, "z": -2.1, "w": 9.4, "d": 7.2, "doors": ["n", "s"], "accent": "gold"},
]
ROOM_BY_NAME = {
    "Alexander": "ceo",
    "Marcus": "technology",
    "Olivia": "product",
    "Sophia": "design",
    "David": "development",
    "Emma": "qa",
}
HOME = {
    "ceo": {"x": 0.0, "y": 0.0, "z": -17.6},
    "technology": {"x": -15.2, "y": 0.0, "z": -6.4},
    "product": {"x": 15.2, "y": 0.0, "z": -6.4},
    "design": {"x": -15.2, "y": 0.0, "z": 8.6},
    "development": {"x": 15.2, "y": 0.0, "z": 8.6},
    "qa": {"x": 0.0, "y": 0.0, "z": 17.6},
    "meeting": {"x": 0.0, "y": 0.0, "z": -2.1},
}


def _animation(name: str, status: str) -> str:
    if status == "assigned":
        return "walk"
    if status == "idle" and name == "Alexander":
        return "thinking"
    return {
        "idle": "idle",
        "working": "working",
        "meeting": "meeting",
        "review": "review",
        "completed": "completed",
        "failed": "failed",
    }.get(status, "idle")


def build_office_state(employees: list[dict]) -> dict:
    people = []
    for employee in employees:
        room_id = employee.get("room_id") or ROOM_BY_NAME.get(employee.get("name", ""), "meeting")
        status = employee.get("status") or "idle"
        anchor = HOME["meeting"] if status == "meeting" else HOME.get(room_id, HOME["meeting"])
        if employee.get("position"):
            anchor = employee["position"]
        people.append(
            {
                "id": str(employee.get("id")),
                "name": employee.get("name"),
                "role": employee.get("role"),
                "department": employee.get("department"),
                "status": status,
                "current_task": employee.get("current_task"),
                "skills": employee.get("skills") or [],
                "room_id": room_id,
                "position": {"x": anchor["x"], "y": anchor.get("y", 0), "z": anchor["z"]},
                "facing": 0,
                "animation": _animation(str(employee.get("name")), str(status)),
            }
        )
    return {"office": {"rooms": ROOMS}, "employees": people}
