from app.models.schemas import ShelterDesign, SimulationResult

def calculate_objective(design: ShelterDesign, sim_result: SimulationResult, max_budget: float = None) -> float:
    """Calculate objective score for optimization, aiming to minimize discomfort and cost."""
    penalty = 0.0
    if max_budget and sim_result.total_cost > max_budget:
        penalty = (sim_result.total_cost - max_budget) * 1000  # Penalty for exceeding budget
    
    # Simple weighted sum: discomfort degree hours + scaled cost + penalties
    return sim_result.discomfort_degree_hours + (sim_result.total_cost * 0.1) + penalty
