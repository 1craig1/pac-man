package pacman.model.entity.dynamic.ghost.strategy;

import pacman.model.entity.dynamic.ghost.Ghost;
import pacman.model.entity.dynamic.physics.Direction;
import pacman.model.entity.dynamic.physics.Vector2D;

public class InkyChaseStrategy implements GhostStrategy {
    private Ghost blinky;

    public InkyChaseStrategy() {

    }

    public void setBlinky(Ghost blinky) {
        this.blinky = blinky;
    }

    @Override
    public Vector2D getTargetLocation(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection, Vector2D scatterTarget) {
        if (blinky == null) {
            return scatterTarget;
        }


        Vector2D blinkyPosition = blinky.getPosition();
        Vector2D targetOffset = currentDirection.getOffsetVector().scale(2);
        Vector2D playerFuturePosition = playerPosition.add(targetOffset);
        Vector2D vectorToPlayerFuture = playerFuturePosition.subtract(blinkyPosition).scale(2);

        Vector2D targetLocation = blinkyPosition.add(vectorToPlayerFuture);
//      System.out.println("Current Strategy: " + this.getClass().getSimpleName() + ", Target Location: " + targetLocation);
        return blinkyPosition.add(vectorToPlayerFuture);
    }
}
