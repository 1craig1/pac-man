// BlinkyChaseStrategy.java
package pacman.model.entity.dynamic.ghost.strategy;

import pacman.model.entity.dynamic.physics.Vector2D;
import pacman.model.entity.dynamic.physics.Direction;

public class BlinkyChaseStrategy implements GhostStrategy {
    @Override
    public Vector2D getTargetLocation(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection, Vector2D scatterTarget) {
        return playerPosition;
    }
}