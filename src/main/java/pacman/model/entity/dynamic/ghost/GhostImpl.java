package pacman.model.entity.dynamic.ghost;

import javafx.scene.image.Image;
import pacman.model.entity.Renderable;
import pacman.model.entity.dynamic.ghost.strategy.GhostStrategy;
import pacman.model.entity.dynamic.ghost.template.ChaseBehavior;
import pacman.model.entity.dynamic.ghost.template.FrightenedBehavior;
import pacman.model.entity.dynamic.ghost.template.GhostBehavior;
import pacman.model.entity.dynamic.ghost.template.ScatterBehavior;
import pacman.model.entity.dynamic.physics.*;
import pacman.model.level.Level;
import pacman.model.maze.Maze;

import java.util.*;

/**
 * Concrete implementation of the Ghost entity in the Pac-Man Game.
 */
public class GhostImpl implements Ghost {

    private static final int minimumDirectionCount = 8;
    private final Layer layer = Layer.FOREGROUND;
    private Image image;
    private final BoundingBox boundingBox;
    private final Vector2D startingPosition;
    private final Vector2D targetCorner;
    private KinematicState kinematicState;
    private GhostMode ghostMode;
    private Vector2D targetLocation;
    private Vector2D playerPosition;
    private Direction currentDirection;
    private Set<Direction> possibleDirections;
    private Map<GhostMode, Double> speeds;
    private int currentDirectionCount = 0;

    private GhostStrategy chaseStrategy;
    private GhostBehavior chaseBehavior;
    private GhostBehavior scatterBehavior;
    private GhostBehavior frightenedBehavior;
    private GhostBehavior currentBehavior;

    private Image normalImage;
    private static final Image FRIGHTENED_IMAGE = new Image("maze/ghosts/frightened.png");

    public GhostImpl(Image image, BoundingBox boundingBox, KinematicState kinematicState, GhostMode ghostMode, Vector2D targetCorner, GhostStrategy chaseStrategy, GhostStrategy scatterStrategy) {
        this.image = image;
        this.normalImage = image;
        this.boundingBox = boundingBox;
        this.kinematicState = kinematicState;
        this.startingPosition = kinematicState.getPosition();
        this.ghostMode = ghostMode;

        this.possibleDirections = new HashSet<>();
        this.chaseStrategy = chaseStrategy;

        // Set up different behavior modes for the ghost
        this.chaseBehavior = new ChaseBehavior(this.kinematicState.getPosition(), playerPosition, currentDirection, chaseStrategy);
        this.scatterBehavior = new ScatterBehavior(this.kinematicState.getPosition(), playerPosition, currentDirection, scatterStrategy);
        this.currentBehavior = (ghostMode == GhostMode.CHASE) ? chaseBehavior : scatterBehavior;

        this.targetCorner = targetCorner;
        this.targetLocation = getTargetLocation();
        this.frightenedBehavior = new FrightenedBehavior(this.kinematicState.getPosition(), currentDirection, possibleDirections);
        this.currentDirection = null;
    }

    public void switchToFrightenedImage() {
        this.image = FRIGHTENED_IMAGE;
    }

    public void restoreNormalImage() {
        this.image = normalImage;
    }

    @Override
    public void setSpeeds(Map<GhostMode, Double> speeds) {
        this.speeds = speeds;
    }

    @Override
    public Image getImage() {
        return image;
    }

    @Override
    public void update() {
        this.updateDirection();
        this.kinematicState.update();
        this.boundingBox.setTopLeft(this.kinematicState.getPosition());
    }

    private void updateDirection() {
        // Ghosts update their target location when they reach an intersection
        if (Maze.isAtIntersection(this.possibleDirections)) {
            this.targetLocation = getTargetLocation();
        }

        Direction newDirection = selectDirection(possibleDirections);

        // Ghosts must continue in a direction for a minimum time before changing direction
        if (this.currentDirection != newDirection) {
            this.currentDirectionCount = 0;
        }
        this.currentDirection = newDirection;

        switch (currentDirection) {
            case LEFT -> this.kinematicState.left();
            case RIGHT -> this.kinematicState.right();
            case UP -> this.kinematicState.up();
            case DOWN -> this.kinematicState.down();
        }
    }

    private Vector2D getTargetLocation() {
        Vector2D location = currentBehavior.move(ghostMode, targetCorner);
        if (location == null) {
            System.out.println("Warning: target location is null in " + currentBehavior.getClass().getSimpleName());
        }
        return location;
    }

    private Direction selectDirection(Set<Direction> possibleDirections) {
        if (possibleDirections.isEmpty()) {
            System.out.println("Possible Directions: " + possibleDirections);
            return currentDirection;
        }

        // Ghosts must continue in a direction for a minimum time before changing direction
        if (currentDirection != null && currentDirectionCount < minimumDirectionCount) {
            currentDirectionCount++;
            return currentDirection;
        }

        Map<Direction, Double> distances = new HashMap<>();

        for (Direction direction : possibleDirections) {
            // Ghosts never choose to reverse travel unless trapped
            if (currentDirection == null || direction != currentDirection.opposite()) {
                distances.put(direction, Vector2D.calculateEuclideanDistance(this.kinematicState.getPotentialPosition(direction), this.targetLocation));
            }
        }

        // Only go the opposite way if trapped
        if (distances.isEmpty()) {
            return currentDirection.opposite();
        }

        // Select the direction that reaches the target location fastest
        return Collections.min(distances.entrySet(), Map.Entry.comparingByValue()).getKey();
    }

    public void setSpeed(double speed) {
        this.kinematicState.setSpeed(speed);
    }

    @Override
    public void setGhostMode(GhostMode ghostMode) {
        this.ghostMode = ghostMode;

        Double newSpeed = speeds.get(ghostMode);
        if (newSpeed != null) {
            setSpeed(newSpeed);
        }

        // Update currentBehavior and set the latest position and direction
        switch (ghostMode) {
            case CHASE -> {
                this.currentBehavior = chaseBehavior;
                ((ChaseBehavior) currentBehavior).updatePositionAndDirection(this.kinematicState.getPosition(), playerPosition, currentDirection);
                restoreNormalImage(); // Restore original image
            }
            case SCATTER -> {
                this.currentBehavior = scatterBehavior;
                ((ScatterBehavior) currentBehavior).updatePositionAndDirection(this.kinematicState.getPosition(), playerPosition, currentDirection);
                restoreNormalImage(); // Restore original image
            }
            case FRIGHTENED -> {
                this.currentBehavior = frightenedBehavior;
                ((FrightenedBehavior) currentBehavior).updatePositionAndDirection(this.kinematicState.getPosition(), playerPosition, currentDirection);
                switchToFrightenedImage(); // Switch to frightened mode image
            }
        }

        this.currentDirectionCount = minimumDirectionCount;
    }

    @Override
    public Object getChaseStrategy() {
        return this.chaseStrategy;
    }

    @Override
    public boolean collidesWith(Renderable renderable) {
        return boundingBox.collidesWith(kinematicState.getSpeed(), kinematicState.getDirection(), renderable.getBoundingBox());
    }

    @Override
    public void collideWith(Level level, Renderable renderable) {
        if (level.isPlayer(renderable)) {
            if (this.ghostMode == GhostMode.FRIGHTENED) {
                // If the ghost is in frightened mode, call Level's scoring logic and reset the ghost
                level.getFrightenedModeManager().handleGhostEaten(this, level);
            } else {
                // If the ghost is not in frightened mode, the player loses a life
                level.handleLoseLife();
            }
        }
    }

    @Override
    public void update(Vector2D playerPosition) {
        this.playerPosition = playerPosition;
    }

    @Override
    public Vector2D getPositionBeforeLastUpdate() {
        return this.kinematicState.getPreviousPosition();
    }

    @Override
    public double getHeight() {
        return this.boundingBox.getHeight();
    }

    @Override
    public double getWidth() {
        return this.boundingBox.getWidth();
    }

    @Override
    public Vector2D getPosition() {
        return this.kinematicState.getPosition();
    }

    @Override
    public void setPosition(Vector2D position) {
        this.kinematicState.setPosition(position);
    }

    @Override
    public Layer getLayer() {
        return this.layer;
    }

    @Override
    public BoundingBox getBoundingBox() {
        return this.boundingBox;
    }

    @Override
    public void reset() {
        // Reset the ghost to its starting position
        this.kinematicState = new KinematicStateImpl.KinematicStateBuilder()
                .setPosition(startingPosition)
                .build();
        this.boundingBox.setTopLeft(startingPosition);
        this.ghostMode = GhostMode.SCATTER;
        this.currentDirectionCount = minimumDirectionCount;
    }

    @Override
    public void setPossibleDirections(Set<Direction> possibleDirections) {
        this.possibleDirections = possibleDirections;
        if (currentBehavior instanceof FrightenedBehavior) {
            ((FrightenedBehavior) currentBehavior).setPossibleDirections(possibleDirections);
        }
    }

    @Override
    public Direction getDirection() {
        return this.kinematicState.getDirection();
    }

    @Override
    public Vector2D getCenter() {
        return new Vector2D(boundingBox.getMiddleX(), boundingBox.getMiddleY());
    }
}
