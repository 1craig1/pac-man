# Pac-Man Game Assignment 3

## How to Run Your Code



### Steps to Compile and Run
 **Compile and Run the Application**: Use the Gradle command to clean, build, and run your application.

```sh
   gradle clean build run
```

### Design Patterns Implemented

This project utilizes several design patterns to structure the code and manage the game state effectively:

#### 1. Strategy Pattern
- **Purpose**: To manage different behaviors for each ghost in the game, allowing each ghost to have unique chase strategies.
- **Classes Involved**:
  - `GhostStrategy`: Defines the interface for ghost behaviors.
  - `BlinkyChaseStrategy`, `PinkyChaseStrategy`, `InkyChaseStrategy`, `ClydeChaseStrategy`: Implement different chase behaviors for each ghost based on their unique characteristics.
- **Package**: `pacman.model.entity.dynamic.ghost.strategy`

#### 2. Template Method Pattern
- **Purpose**: To define a framework for different ghost modes (CHASE, SCATTER, FRIGHTENED) while allowing each mode to specify its unique behavior.
- **Classes Involved**:
  - `GhostBehavior`: An abstract class that outlines the general structure of ghost behaviors and defines the template method for movement.
  - `ChaseBehavior`, `ScatterBehavior`, `FrightenedBehavior`: Implement specific ghost behaviors for chase, scatter, and frightened modes.
- **Package**: `pacman.model.entity.dynamic.ghost.template`

#### 3. Facade Pattern
- **Purpose**: Simplifies and centralizes the control of ghost mode transitions, allowing the game level to manage frightened mode activation and transitions easily.
- **Classes Involved**:
  - `FrightenedModeManager`: Manages the activation and end of the frightened mode for all ghosts, handling speed adjustments and mode transitions.
  - `LevelImpl`: Provides simplified methods `startFrightenedMode()` and `resetModeTransition()` to initiate and reset frightened mode via the `FrightenedModeManager`.
- **Package**: `pacman.model.entity.dynamic.ghost`