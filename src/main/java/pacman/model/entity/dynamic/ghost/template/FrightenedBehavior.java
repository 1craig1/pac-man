// FrightenedBehavior.java
package pacman.model.entity.dynamic.ghost.template;

import pacman.model.entity.dynamic.ghost.strategy.FrightenedStrategy;
import pacman.model.entity.dynamic.physics.Vector2D;
import pacman.model.entity.dynamic.physics.Direction;

import java.util.Set;

public class FrightenedBehavior extends GhostBehavior {
    private final FrightenedStrategy frightenedStrategy;
    private Set<Direction> possibleDirections;

    /**
     * Constructor for FrightenedBehavior.
     *
     * @param ghostPosition    The current position of the ghost
     * @param currentDirection The current direction the ghost is moving
     * @param possibleDirections Set of possible directions the ghost can move in
     */
    public FrightenedBehavior(Vector2D ghostPosition, Direction currentDirection, Set<Direction> possibleDirections) {
        super(ghostPosition, null, currentDirection);
        this.frightenedStrategy = new FrightenedStrategy();
        this.possibleDirections = possibleDirections;
    }

    /**
     * Moves the ghost in FRIGHTENED mode by selecting a random direction from possible directions.
     *
     * @return The current position of the ghost (doesn't move to a specific target in frightened mode)
     */
    @Override
    protected Vector2D moveInFrightenedMode() {
        // Select a random direction from possible directions in FRIGHTENED mode
        Direction newDirection = frightenedStrategy.getRandomDirection(possibleDirections);
        this.currentDirection = newDirection;
        return ghostPosition;
    }

    /**
     * Sets the possible directions the ghost can move in.
     *
     * @param possibleDirections Set of directions the ghost can take
     */
    public void setPossibleDirections(Set<Direction> possibleDirections) {
        this.possibleDirections = possibleDirections;
    }

    /**
     * Unsupported operation for CHASE mode in FrightenedBehavior.
     */
    @Override
    protected Vector2D moveInChaseMode() {
        throw new UnsupportedOperationException("FrightenedBehavior does not support Chase mode.");
    }

    /**
     * Unsupported operation for SCATTER mode in FrightenedBehavior.
     */
    @Override
    protected Vector2D moveInScatterMode(Vector2D scatterTarget) {
        throw new UnsupportedOperationException("FrightenedBehavior does not support Scatter mode.");
    }

    /**
     * Updates the ghost's position, player position, and direction.
     * Used to maintain the current state of the ghost for frightened behavior.
     *
     * @param ghostPosition    The new position of the ghost
     * @param playerPosition   The new position of the player (not used in FrightenedBehavior)
     * @param currentDirection The new direction the ghost is moving
     */
    public void updatePositionAndDirection(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection) {
        this.ghostPosition = ghostPosition;
        this.playerPosition = playerPosition;
        this.currentDirection = currentDirection;
    }
}
