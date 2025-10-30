package pacman.model.entity.dynamic.physics;

import javax.swing.*;

/**
 * Represents the cardinal directions allowed for movement in Pac-Man
 */
public enum Direction {
    UP, DOWN, LEFT, RIGHT;

    /**
     * Retrieves the opposite direction
     *
     * @return the opposite direction
     */
    public Direction opposite() {
        return switch (this) {
            case UP -> DOWN;
            case DOWN -> UP;
            case LEFT -> RIGHT;
            case RIGHT -> LEFT;
        };
    }

    public Vector2D getOffsetVector() {
        return switch (this) {
            case UP -> new Vector2D(0, -1);
            case DOWN -> new Vector2D(0, 1);
            case LEFT -> new Vector2D(-1, 0);
            case RIGHT -> new Vector2D(1, 0);
        };
    }

}
