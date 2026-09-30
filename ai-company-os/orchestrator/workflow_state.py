from enum import StrEnum
class ExecutionTaskState(StrEnum): CREATED='created';ASSIGNED='assigned';WORKING='working';REVIEW='review';COMPLETED='completed';FAILED='failed'
ALLOWED={ExecutionTaskState.CREATED:{ExecutionTaskState.ASSIGNED,ExecutionTaskState.FAILED},ExecutionTaskState.ASSIGNED:{ExecutionTaskState.WORKING,ExecutionTaskState.FAILED},ExecutionTaskState.WORKING:{ExecutionTaskState.REVIEW,ExecutionTaskState.FAILED},ExecutionTaskState.REVIEW:{ExecutionTaskState.WORKING,ExecutionTaskState.COMPLETED,ExecutionTaskState.FAILED},ExecutionTaskState.COMPLETED:set(),ExecutionTaskState.FAILED:set()}
def transition(current,next_state):
 if next_state not in ALLOWED[current]:raise ValueError(f'Invalid transition {current}->{next_state}')
 return next_state
