def stage_multiplier(sublevel):
    if sublevel <= 3:
        return 1
    elif sublevel <= 6:
        return 2
    return 3
  
def stage_name(sublevel: int) -> str:
    if sublevel <= 3:
        return "Initial"
    elif sublevel <= 6:
        return "Mid"
    return "Late"

