# Kitchen Cabinet Cost Calculator

This project is a kitchen cabinet cost calculator that allows users to input wall dimensions, door and window placements, and view a 2D elevation plan of their kitchen layout.

## Features

- Input wall dimensions
- Specify door and window placements
- Calculate the total cost of kitchen cabinets
- View a 2D elevation plan based on user inputs

## Project Structure

```
kitchen-cabinet-calculator
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── calculator
│   │   │           ├── Main.java
│   │   │           ├── models
│   │   │           │   ├── Wall.java
│   │   │           │   ├── Door.java
│   │   │           │   ├── Window.java
│   │   │           │   └── Cabinet.java
│   │   │           ├── services
│   │   │           │   ├── CostCalculator.java
│   │   │           │   └── ElevationRenderer.java
│   │   │           └── controllers
│   │   │               └── CalculatorController.java
│   │   └── resources
│   │       └── static
│   │           ├── index.html
│   │           ├── css
│   │           │   └── styles.css
│   │           └── js
│   │               └── app.js
│   └── test
│       └── java
│           └── com
│               └── calculator
│                   └── CostCalculatorTest.java
├── pom.xml
└── README.md
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd kitchen-cabinet-calculator
   ```

3. Build the project using Maven:
   ```
   mvn clean install
   ```

4. Run the application:
   ```
   mvn spring-boot:run
   ```

5. Open your web browser and go to `http://localhost:8080` to access the application.

## Usage Guidelines

- Enter the wall dimensions in the provided fields.
- Specify the placements of doors and windows.
- Click on the "Calculate Cost" button to see the total cost of the kitchen cabinets.
- The 2D elevation plan will be displayed based on your inputs.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.