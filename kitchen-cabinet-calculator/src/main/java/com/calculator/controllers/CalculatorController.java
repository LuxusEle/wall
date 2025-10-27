package com.calculator.controllers;

import com.calculator.models.Wall;
import com.calculator.services.CostCalculator;
import com.calculator.services.ElevationRenderer;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calculator")
public class CalculatorController {

    private final CostCalculator costCalculator;
    private final ElevationRenderer elevationRenderer;

    public CalculatorController(CostCalculator costCalculator, ElevationRenderer elevationRenderer) {
        this.costCalculator = costCalculator;
        this.elevationRenderer = elevationRenderer;
    }

    @PostMapping("/calculateCost")
    public double calculateCost(@RequestBody Wall wall) {
        return costCalculator.calculateTotalCost(wall);
    }

    @PostMapping("/renderElevation")
    public String renderElevation(@RequestBody Wall wall) {
        return elevationRenderer.renderElevation(wall);
    }

    @GetMapping("/walls")
    public List<Wall> getWalls() {
        // This method can be implemented to return a list of walls if needed
        return List.of(); // Placeholder for actual wall retrieval logic
    }
}