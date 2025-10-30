// ScatterBehavior.java
package pacman.model.entity.dynamic.ghost.template;

import pacman.model.entity.dynamic.ghost.strategy.GhostStrategy;
import pacman.model.entity.dynamic.physics.Vector2D;
import pacman.model.entity.dynamic.physics.Direction;

public class ScatterBehavior extends GhostBehavior {
    private final GhostStrategy scatterStrategy;

    /**
     * Constructor for ScatterBehavior.
     *
     * @param ghostPosition    The current position of the ghost
     * @param playerPosition   The position of the player
     * @param currentDirection The current direction the ghost is moving
     * @param scatterStrategy  The strategy used in SCATTER mode to determine the target location
     */
    public ScatterBehavior(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection, GhostStrategy scatterStrategy) {
        super(ghostPosition, playerPosition, currentDirection);
        this.scatterStrategy = scatterStrategy;
    }

    /**
     * Moves the ghost in SCATTER mode by using the scatter strategy to get the target location.
     *
     * @param scatterTarget The target corner for SCATTER mode
     * @return The target location for SCATTER mode
     */
    @Override
    protected Vector2D moveInScatterMode(Vector2D scatterTarget) {
        // Use scatterStrategy to obtain the target location in SCATTER mode
        return scatterStrategy.getTargetLocation(ghostPosition, playerPosition, currentDirection, scatterTarget);
    }

    /**
     * Unsupported operation for CHASE mode in ScatterBehavior.
     */
    @Override
    protected Vector2D moveInChaseMode() {
        throw new UnsupportedOperationException("ScatterBehavior does not support Chase mode.");
    }

    /**
     * Unsupported operation for FRIGHTENED mode in ScatterBehavior.
     */
    @Override
    protected Vector2D moveInFrightenedMode() {
        throw new UnsupportedOperationException("ScatterBehavior does not support Frightened mode.");
    }

    /**
     * Updates the position and direction of the ghost.
     *
     * @param ghostPosition    The new position of the ghost
     * @param playerPosition   The new position of the player
     * @param currentDirection The new direction the ghost is moving
     */
    public void updatePositionAndDirection(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection) {
        this.ghostPosition = ghostPosition;
        this.playerPosition = playerPosition;
        this.currentDirection = currentDirection;
    }
}
