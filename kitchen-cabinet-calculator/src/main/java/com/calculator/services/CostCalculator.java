public class CostCalculator {
    private static final double COST_PER_CABINET = 200.0; // Example cost per cabinet
    private static final double COST_PER_DOOR = 50.0; // Example cost per door
    private static final double COST_PER_WINDOW = 30.0; // Example cost per window

    public double calculateTotalCost(int numberOfCabinets, int numberOfDoors, int numberOfWindows) {
        double totalCost = 0.0;
        totalCost += numberOfCabinets * COST_PER_CABINET;
        totalCost += numberOfDoors * COST_PER_DOOR;
        totalCost += numberOfWindows * COST_PER_WINDOW;
        return totalCost;
    }
}