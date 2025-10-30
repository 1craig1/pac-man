package pacman.model.factories;

import javafx.scene.image.Image;
import pacman.ConfigurationParseException;
import pacman.model.entity.Renderable;
import pacman.model.entity.dynamic.ghost.GhostImpl;
import pacman.model.entity.dynamic.ghost.GhostMode;
import pacman.model.entity.dynamic.ghost.strategy.*;
import pacman.model.entity.dynamic.physics.*;

import java.util.Arrays;
import java.util.List;

/**
 * Concrete renderable factory for creating Ghost objects.
 */
public class GhostFactory implements RenderableFactory {
    private char ghostType;
    private GhostStrategy chaseStrategy;
    private GhostStrategy scatterStrategy;

    // Constants defining map boundaries for positioning the ghosts' target corners.
    private static final int RIGHT_X_POSITION_OF_MAP = 448;
    private static final int TOP_Y_POSITION_OF_MAP = 16 * 3;
    private static final int BOTTOM_Y_POSITION_OF_MAP = 16 * 34;

    // Ghost images based on type.
    private static final Image BLINKY_IMAGE = new Image("maze/ghosts/blinky.png");
    private static final Image INKY_IMAGE = new Image("maze/ghosts/inky.png");
    private static final Image CLYDE_IMAGE = new Image("maze/ghosts/clyde.png");
    private static final Image PINKY_IMAGE = new Image("maze/ghosts/pinky.png");

    // List of target corners for each ghost in SCATTER mode.
    private List<Vector2D> targetCorners = Arrays.asList(
            new Vector2D(0, TOP_Y_POSITION_OF_MAP), // Top left corner
            new Vector2D(RIGHT_X_POSITION_OF_MAP, TOP_Y_POSITION_OF_MAP), // Top right corner
            new Vector2D(0, BOTTOM_Y_POSITION_OF_MAP), // Bottom left corner
            new Vector2D(RIGHT_X_POSITION_OF_MAP, BOTTOM_Y_POSITION_OF_MAP) // Bottom right corner
    );

    public GhostFactory(char ghostType) {
        this.ghostType = ghostType;
    }

    @Override
    public Renderable createRenderable(Vector2D position) {
        try {
            Image ghostImage;
            Vector2D targetCorner;

            // Determine ghost properties based on type.
            switch (ghostType) {
                case RenderableType.BLINKY -> {
                    ghostImage = BLINKY_IMAGE;
                    targetCorner = targetCorners.get(1); // Top right corner
                    chaseStrategy = new BlinkyChaseStrategy();
                    scatterStrategy = new ScatterStrategy(targetCorner);
                }
                case RenderableType.PINKY -> {
                    ghostImage = PINKY_IMAGE;
                    targetCorner = targetCorners.get(0); // Top left corner
                    chaseStrategy = new PinkyChaseStrategy();
                    scatterStrategy = new ScatterStrategy(targetCorner);
                }
                case RenderableType.INKY -> {
                    ghostImage = INKY_IMAGE;
                    targetCorner = targetCorners.get(3); // Bottom right corner
                    chaseStrategy = new InkyChaseStrategy();
                    scatterStrategy = new ScatterStrategy(targetCorner);
                }
                case RenderableType.CLYDE -> {
                    ghostImage = CLYDE_IMAGE;
                    targetCorner = targetCorners.get(2); // Bottom left corner
                    chaseStrategy = new ClydeChaseStrategy();
                    scatterStrategy = new ScatterStrategy(targetCorner);
                }
                default -> throw new IllegalArgumentException("Unknown ghost type: " + ghostType);
            }

            // Adjust initial position with an offset.
            position = position.add(new Vector2D(4, -4));

            // Define the ghost's bounding box for collision detection.
            BoundingBox boundingBox = new BoundingBoxImpl(
                    position,
                    ghostImage.getHeight(),
                    ghostImage.getWidth()
            );

            // Initialize the ghost's kinematic state.
            KinematicState kinematicState = new KinematicStateImpl.KinematicStateBuilder()
                    .setPosition(position)
                    .build();

            // Return a new GhostImpl instance with the configured properties.
            return new GhostImpl(
                    ghostImage,
                    boundingBox,
                    kinematicState,
                    GhostMode.SCATTER, // Initial mode set to SCATTER
                    targetCorner,
                    chaseStrategy,
                    scatterStrategy
            );
        } catch (Exception e) {
            throw new ConfigurationParseException(
                    String.format("Invalid ghost configuration | %s ", e));
        }
    }
}
