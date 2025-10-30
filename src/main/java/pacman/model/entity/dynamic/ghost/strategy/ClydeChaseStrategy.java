package pacman.model.entity.dynamic.ghost.strategy;

import pacman.model.entity.dynamic.physics.Direction;
import pacman.model.entity.dynamic.physics.Vector2D;

// Clyde 的追逐策略
public class ClydeChaseStrategy implements GhostStrategy {
    @Override
    public Vector2D getTargetLocation(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection, Vector2D scatterTarget) {

        double distance = Vector2D.calculateEuclideanDistance(ghostPosition, playerPosition);

        return (distance > 8) ? playerPosition : scatterTarget;

    }
}