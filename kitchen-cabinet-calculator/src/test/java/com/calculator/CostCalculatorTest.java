import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CostCalculatorTest {
    private CostCalculator costCalculator;

    @BeforeEach
    void setUp() {
        costCalculator = new CostCalculator();
    }

    @Test
    void testCalculateTotalCost() {
        // Example test case
        double expectedCost = 1000.0; // Expected cost based on input
        double actualCost = costCalculator.calculateTotalCost(10, 5, 2); // Example dimensions and quantities
        assertEquals(expectedCost, actualCost, 0.01);
    }

    @Test
    void testCalculateCostWithDoors() {
        // Test case for calculating cost with doors
        double expectedCost = 1200.0; // Expected cost based on input
        double actualCost = costCalculator.calculateTotalCost(10, 5, 3); // Example dimensions and quantities with doors
        assertEquals(expectedCost, actualCost, 0.01);
    }

    @Test
    void testCalculateCostWithWindows() {
        // Test case for calculating cost with windows
        double expectedCost = 1100.0; // Expected cost based on input
        double actualCost = costCalculator.calculateTotalCost(10, 5, 1); // Example dimensions and quantities with windows
        assertEquals(expectedCost, actualCost, 0.01);
    }
}