class TaskScheduler:
 def is_phase_complete(self,states): return bool(states) and all(s=="completed" for s in states)
