// FrightenedStrategy.java
package pacman.model.entity.dynamic.ghost.strategy;

import pacman.model.entity.dynamic.physics.Direction;
import pacman.model.entity.dynamic.physics.Vector2D;

import java.util.Set;
import java.util.Random;

public class FrightenedStrategy implements GhostStrategy {
    private final Random random = new Random();

    @Override
    public Vector2D getTargetLocation(Vector2D ghostPosition, Vector2D playerPosition, Direction currentDirection, Vector2D scatterTarget) {
        return ghostPosition;
    }

    public Direction getRandomDirection(Set<Direction> possibleDirections) {
//        System.out.println("！！！！！！！！！！！！！！！！！Possible Directions: " + possibleDirections);
            int index = random.nextInt(possibleDirections.size());
            return (Direction) possibleDirections.toArray()[index];
        }

    }
