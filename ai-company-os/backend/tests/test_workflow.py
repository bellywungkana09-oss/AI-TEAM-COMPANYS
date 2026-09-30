from orchestrator.workflow_state import *
def test_transition():assert transition(ExecutionTaskState.CREATED,ExecutionTaskState.ASSIGNED)==ExecutionTaskState.ASSIGNED
