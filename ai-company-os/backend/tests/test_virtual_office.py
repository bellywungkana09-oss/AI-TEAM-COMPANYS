from app.services.virtual_office_service import build_office_state


def test_virtual_office_state_rooms_and_positions():
    state = build_office_state(
        [
            {
                "id": "alexander",
                "name": "Alexander",
                "role": "CEO AI",
                "department": "Executive",
                "status": "idle",
                "current_task": "Available",
                "skills": ["strategy", "leadership"],
            },
            {
                "id": "emma",
                "name": "Emma",
                "role": "Quality Assurance AI",
                "department": "Quality Assurance",
                "status": "review",
                "current_task": "Reviewing quality gates",
                "skills": ["testing"],
            },
        ]
    )
    assert state["office"]["rooms"]
    assert any(room["id"] == "ceo" for room in state["office"]["rooms"])
    alexander = next(person for person in state["employees"] if person["name"] == "Alexander")
    emma = next(person for person in state["employees"] if person["name"] == "Emma")
    assert alexander["position"]["z"] < 0
    assert alexander["animation"] == "thinking"
    assert emma["room_id"] == "qa"
    assert emma["position"]["z"] > 0
    assert "skills" in alexander


def test_meeting_moves_employee_to_meeting_room():
    state = build_office_state(
        [{"id": "marcus", "name": "Marcus", "role": "CTO AI", "department": "Technology", "status": "meeting", "skills": []}]
    )
    marcus = state["employees"][0]
    assert marcus["room_id"] == "technology"
    assert marcus["animation"] == "meeting"
    assert abs(marcus["position"]["z"] + 2.1) < 0.2
