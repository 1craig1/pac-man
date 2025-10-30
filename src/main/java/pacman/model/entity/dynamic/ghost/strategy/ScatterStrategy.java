// ScatterStrategy.java
package pacman.model.entity.dynamic.ghost.strategy;

import pacman.model.entity.dynamic.physics.Direction;
import pacman.model.entity.dynamic.physics.Vector2D;

public class ScatterStrategy implements GhostStrategy {
    private final Vector2D scatterTargetCorner;

    public ScatterStrategy(Vector2D scatterTargetCorner) {
        this.scatterTargetCorner = scatterTargetCorner;
    }

    @Override
    public Vector2D getTargetLocation(Vector2D ghostPosition, Vector2D pacmanPosition, Direction pacmanDirection, Vector2D blinkyPosition) {
        Vector2D targetLocation = scatterTargetCorner;
//        System.out.println("Current Strategy: " + this.getClass().getSimpleName() + ", Target Location: " + targetLocation);

        return scatterTargetCorner;
    }

}
