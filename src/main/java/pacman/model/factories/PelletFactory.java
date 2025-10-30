package pacman.model.factories;

import javafx.scene.image.Image;
import pacman.ConfigurationParseException;
import pacman.model.entity.Renderable;
import pacman.model.entity.dynamic.physics.BoundingBox;
import pacman.model.entity.dynamic.physics.BoundingBoxImpl;
import pacman.model.entity.dynamic.physics.Vector2D;
import pacman.model.entity.staticentity.collectable.Pellet;

/**
 * Concrete renderable factory for creating Pellet objects.
 */
public class PelletFactory implements RenderableFactory {
    private static final Image PELLET_IMAGE = new Image("maze/pellet.png");

    // Point values for normal pellets and power pellets.
    private static final int PELLET_POINTS = 10;
    private static final int POWER_PELLET_POINTS = 50;

    // Layer where pellets are rendered.
    private final Renderable.Layer layer = Renderable.Layer.BACKGROUND;

    // Type of pellet, either normal or power pellet.
    private final char pelletType;

    public PelletFactory(char pelletType) {
        this.pelletType = pelletType;
    }

    @Override
    public Renderable createRenderable(Vector2D position) {
        try {
            Image image = PELLET_IMAGE;
            int points = (pelletType == RenderableType.POWER_PELLET) ? POWER_PELLET_POINTS : PELLET_POINTS;
            boolean isPowerPellet = (pelletType == RenderableType.POWER_PELLET);
            Vector2D adjustedPosition;

            // Set size of BoundingBox; Power Pellets are twice the size of normal Pellets.
            double width = (pelletType == RenderableType.POWER_PELLET) ? image.getWidth() * 2 : image.getWidth();
            double height = (pelletType == RenderableType.POWER_PELLET) ? image.getHeight() * 2 : image.getHeight();

            if (pelletType == RenderableType.POWER_PELLET) {
                // Adjust position to center-align the Power Pellet image.
                double offsetX = image.getWidth() / 2;
                double offsetY = image.getHeight() / 2;
                adjustedPosition = new Vector2D(position.getX() - offsetX, position.getY() - offsetY);
            } else {
                adjustedPosition = position; // No adjustment needed for normal Pellets.
            }

            // Create BoundingBox for collision detection.
            BoundingBox boundingBox = new BoundingBoxImpl(
                    adjustedPosition,
                    height,
                    width
            );

            // Return a new Pellet instance with the specified properties.
            return new Pellet(
                    boundingBox,
                    layer,
                    image,
                    points,
                    isPowerPellet
            );

        } catch (Exception e) {
            throw new ConfigurationParseException(
                    String.format("Invalid pellet configuration | %s", e)
            );
        }
    }
}
