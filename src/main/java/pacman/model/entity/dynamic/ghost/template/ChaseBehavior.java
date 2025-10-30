// ChaseBehavior.java
package pacman.model.entity.dynamic.ghost.template;

import pacman.model.entity.dynamic.ghost.strategy.GhostStrategy;
import pacman.model.entity.dynamic.physics.Vector2D;
import pacman.model.entity.dynamic.physics.Direction;

public class ChaseBehavior extends GhostBehavior {
    private final GhostStrategy chaseStrategy;

    /**
     * Constructor for ChaseBehavior.
     *
     * @param ghostPosition    The current position of the ghost
     * @param playerPosition   The position of the player (Pac-Man)
     * @param currentDirection The current direction the ghost is moving
     * @param chaseStrategy    The strategy used to calculate the target location in CHASE mode
     */
    public ChaseBehavior(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection, GhostStrategy chaseStrategy) {
        super(ghostPosition, playerPosition, currentDirection);
        this.chaseStrategy = chaseStrategy;
    }

    @Override
    protected Vector2D moveInChaseMode() {
        // Retrieve the target location using the chase strategy
        return chaseStrategy.getTargetLocation(ghostPosition, playerPosition, currentDirection, null);
    }

    @Override
    protected Vector2D moveInScatterMode(Vector2D scatterTarget) {
        // This behavior does not support SCATTER mode
        throw new UnsupportedOperationException("ChaseBehavior does not support Scatter mode.");
    }

    @Override
    protected Vector2D moveInFrightenedMode() {
        // This behavior does not support FRIGHTENED mode
        throw new UnsupportedOperationException("ChaseBehavior does not support Frightened mode.");
    }

    /**
     * Gets the chase strategy associated with this behavior.
     *
     * @return The chase strategy
     */
    protected GhostStrategy getChaseStrategy(){
        return this.chaseStrategy;
    }

    /**
     * Updates the ghost's position and direction.
     * This method should be called when there is a change in the ghost’s position, player position, or direction.
     *
     * @param ghostPosition    The new position of the ghost
     * @param playerPosition   The new position of the player (Pac-Man)
     * @param currentDirection The new direction the ghost is moving
     */
    public void updatePositionAndDirection(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection) {
        this.ghostPosition = ghostPosition;
        this.playerPosition = playerPosition;
        this.currentDirection = currentDirection;
    }
}
