
# Pac-Man Game Assignment 3

## How to Run Your Code



### Steps to Compile and Run
 **Compile and Run the Application**: Use the Gradle command to clean, build, and run your application.

   ```bash
   gradle clean build run
   ```

### Design Patterns Implemented

This project utilizes several design patterns to structure the code and manage the game state effectively:

#### 1. Strategy Pattern
- **Purpose**: Manage different behaviours for each ghost in the game, allowing type-specific chase targeting.
- **Classes Involved**:
  - `GhostStrategy`: Defines the interface for ghost behaviours.
  - `BlinkyChaseStrategy`, `PinkyChaseStrategy`, `InkyChaseStrategy`, `ClydeChaseStrategy`: Implement chase behaviours per ghost.
- **Package**: `pacman.model.entity.dynamic.ghost.strategy`

#### 2. Template Method Pattern
- **Purpose**: Define the framework for ghost modes (CHASE, SCATTER, FRIGHTENED) while letting subclasses fill in mode-specific logic.
- **Classes Involved**:
  - `GhostBehavior`: Outlines the template for movement.
  - `ChaseBehavior`, `ScatterBehavior`, `FrightenedBehavior`: Implement the hook methods for each mode.
- **Package**: `pacman.model.entity.dynamic.ghost.template`

#### 3. Facade Pattern
- **Purpose**: Simplify and centralise frightened-mode activation and timing.
- **Classes Involved**:
  - `FrightenedModeManager`: Coordinates mode switching, ghost speed updates, and score bonuses.
  - `LevelImpl`: Calls high-level methods `startFrightenedMode()` and `resetModeTransition()` to trigger the facade.
- **Package**: `pacman.model.entity.dynamic.ghost`

#### 4. Observer Pattern
- **Purpose**: Propagate game-state changes to interested parties without tight coupling.
- **Examples**:
  - `Pacman` implements `PlayerPositionSubject` and notifies `Ghost` observers of position updates.
  - `GameEngineImpl` and `LevelImpl` notify registered `GameStateObserver` and `LevelStateObserver` instances about progression events.
- **Packages**: `pacman.model.entity.dynamic.player.observer`, `pacman.model.engine.observer`, `pacman.model.level.observer`

#### 5. Command Pattern
- **Purpose**: Encapsulate user input actions so they can be queued, executed, and validated independently.
- **Classes Involved**:
  - `MoveCommand` interface with concrete commands (`MoveUpCommand`, `MoveDownCommand`, etc.) that call the model.
  - `MovementInvoker`: Stores current and queued commands and executes them when movement is possible.
- **Packages**: `pacman.view.keyboard.command`, `pacman.model.entity.dynamic.player`

#### 6. Singleton Pattern
- **Purpose**: Ensure only one command invoker coordinates player movement.
- **Class**: `MovementInvoker` exposes `getInstance()` and maintains a single shared instance.
- **Package**: `pacman.model.entity.dynamic.player`

#### 7. Factory Pattern
- **Purpose**: Create renderable entities based on map configuration while isolating construction logic.
- **Classes Involved**:
  - `RenderableFactoryRegistryImpl`: Delegates creation to registered factories.
  - Concrete factories such as `GhostFactory`, `PelletFactory`, `WallFactory`, and `PacmanFactory`.
- **Package**: `pacman.model.factories`

#### 8. Builder Pattern
- **Purpose**: Provide a fluent API for constructing complex objects with optional parameters.
- **Class**: `KinematicStateImpl.KinematicStateBuilder` builds `KinematicStateImpl` instances with configurable position, speed, and direction.
- **Package**: `pacman.model.entity.dynamic.physics`
