from deployment.deployment_state import TRANSITIONS,DeliveryState
class DeploymentManager:
 def transition(self,current,next_state):
  if next_state not in TRANSITIONS[current]:raise ValueError('Invalid delivery transition')
  if next_state==DeliveryState.DEPLOYED:raise PermissionError('Autonomous deployment prohibited')
  return next_state
