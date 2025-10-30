package pacman.model.entity.dynamic.ghost.strategy;

import pacman.model.entity.dynamic.physics.Direction;
import pacman.model.entity.dynamic.physics.Vector2D;

public class PinkyChaseStrategy implements GhostStrategy {

    @Override
    public Vector2D getTargetLocation(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection, Vector2D scatterTarget) {

        Vector2D targetOffset = currentDirection.getOffsetVector().scale(4);

        Vector2D targetLocation = playerPosition.add(targetOffset);
//      System.out.println("Current Strategy: " + this.getClass().getSimpleName() + ", Target Location: " + targetLocation);


        return playerPosition.add(targetOffset);
    }
}