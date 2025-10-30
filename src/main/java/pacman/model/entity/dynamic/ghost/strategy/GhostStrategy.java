// GhostStrategy.java
package pacman.model.entity.dynamic.ghost.strategy;

import pacman.model.entity.dynamic.physics.Vector2D;
import pacman.model.entity.dynamic.physics.Direction;

public interface GhostStrategy {
    /**
     * Calculates the next target location based on the ghost's current state and the target position.
     *
     * @param ghostPosition The current position of the ghost
     * @param playerPosition The position of the player
     * @param currentDirection The current direction of the ghost
     * @param scatterTarget The target corner for SCATTER mode
     * @return The target location
     */
    Vector2D getTargetLocation(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection, Vector2D scatterTarget);
}
