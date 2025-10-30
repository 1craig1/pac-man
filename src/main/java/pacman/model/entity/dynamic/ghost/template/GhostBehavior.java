// GhostBehavior.java
package pacman.model.entity.dynamic.ghost.template;

import pacman.model.entity.dynamic.ghost.GhostMode;
import pacman.model.entity.dynamic.physics.Vector2D;
import pacman.model.entity.dynamic.physics.Direction;

import java.util.Set;

public abstract class GhostBehavior {
    protected Vector2D ghostPosition;
    protected Vector2D playerPosition;
    protected Direction currentDirection;
    protected Set<Direction> possibleDirections;

    /**
     * Constructor for GhostBehavior.
     *
     * @param ghostPosition    The current position of the ghost
     * @param playerPosition   The position of the player
     * @param currentDirection The current direction the ghost is moving
     */
    public GhostBehavior(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection) {
        this.ghostPosition = ghostPosition;
        this.playerPosition = playerPosition;
        this.currentDirection = currentDirection;
    }

    /**
     * Template method that determines the behavior based on the ghost's current mode.
     *
     * @param mode           The mode of the ghost (CHASE, SCATTER, or FRIGHTENED)
     * @param scatterTarget  The target location for SCATTER mode
     * @return The target location based on the mode
     */
    public final Vector2D move(GhostMode mode, Vector2D scatterTarget) {
        switch (mode) {
            case CHASE:
                return moveInChaseMode();
            case SCATTER:
                return moveInScatterMode(scatterTarget);
            case FRIGHTENED:
                return moveInFrightenedMode();
            default:
                throw new IllegalStateException("Unexpected mode: " + mode);
        }
    }

    /**
     * Abstract method for CHASE mode behavior, implemented by subclasses.
     *
     * @return The target location in CHASE mode
     */
    protected abstract Vector2D moveInChaseMode();

    /**
     * Abstract method for SCATTER mode behavior, implemented by subclasses.
     *
     * @param scatterTarget The target corner for SCATTER mode
     * @return The target location in SCATTER mode
     */
    protected abstract Vector2D moveInScatterMode(Vector2D scatterTarget);

    /**
     * Abstract method for FRIGHTENED mode behavior, implemented by subclasses.
     *
     * @return The new location or direction in FRIGHTENED mode
     */
    protected abstract Vector2D moveInFrightenedMode();
}
