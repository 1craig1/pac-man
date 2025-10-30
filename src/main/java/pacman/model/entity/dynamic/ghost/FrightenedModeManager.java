package pacman.model.entity.dynamic.ghost;

import javafx.animation.PauseTransition;
import javafx.util.Duration;
import pacman.model.entity.Renderable;
import pacman.model.entity.dynamic.physics.Vector2D;
import pacman.model.level.Level;
import pacman.model.level.LevelConfigurationReader;
import pacman.model.level.LevelImpl;
import pacman.model.maze.Maze;

import java.util.Map;

public class FrightenedModeManager {
    private Maze maze;
    private boolean isFrightenedActive;
    private Map<GhostMode, Double> ghostSpeeds;
    private PauseTransition frightenedTransition;
    private final LevelImpl level;

    /**
     * Constructor for FrightenedModeManager.
     *
     * @param maze          The maze containing the ghosts
     * @param configReader  The configuration reader to retrieve mode durations and speeds
     * @param level         The level instance to manage score and state
     */
    public FrightenedModeManager(Maze maze, LevelConfigurationReader configReader, LevelImpl level) {
        this.level = level;
        this.maze = maze;
        this.ghostSpeeds = configReader.getGhostSpeeds();
        this.isFrightenedActive = false;

        // Set up the frightened mode timer
        int frightenedDurationInSeconds = configReader.getGhostModeLengths().get(GhostMode.FRIGHTENED);
        frightenedTransition = new PauseTransition(Duration.seconds(frightenedDurationInSeconds));
        frightenedTransition.setOnFinished(event -> endFrightenedMode());
    }

    /**
     * Activates frightened mode, changing all ghosts to frightened behavior
     * and setting their speed according to the configuration.
     */
    public void activateFrightenedMode() {
        isFrightenedActive = true;
        frightenedTransition.playFromStart();

        for (Renderable renderable : maze.getGhosts()) {
            if (renderable instanceof Ghost) {
                Ghost ghost = (Ghost) renderable;
                ghost.setGhostMode(GhostMode.FRIGHTENED);
                ghost.setSpeed(ghostSpeeds.get(GhostMode.FRIGHTENED));
            }
        }

        level.resetModeTransition();
    }

    /**
     * Handles the event when a ghost is eaten during frightened mode.
     *
     * @param ghost The ghost that was eaten
     * @param level The level instance to add points for eating the ghost
     */
    public void handleGhostEaten(Ghost ghost, Level level) {
        if (isFrightenedActive) {
            // Move the ghost off-screen to simulate disappearance
            Vector2D offScreenPosition = new Vector2D(-100, -100); // Off-screen coordinates
            ghost.setPosition(offScreenPosition);

            // Set the ghost to SCATTER mode without updating the image immediately
            ghost.setGhostMode(GhostMode.SCATTER);

            // Set up a 1-second delay before respawning the ghost
            PauseTransition respawnDelay = new PauseTransition(Duration.seconds(1));
            respawnDelay.setOnFinished(event -> {
                // Respawn the ghost after 1 second
                ghost.reset(); // Reset to starting position
                ghost.setGhostMode(GhostMode.SCATTER); // Ensure mode is SCATTER
                ghost.setSpeed(ghostSpeeds.get(GhostMode.SCATTER)); // Set SCATTER mode speed
            });

            // Start the respawn delay timer
            respawnDelay.play();

            // Calculate the score reward
            int scoreReward = 200;
            level.addPoints(scoreReward);  // Assuming the Level class has an addPoints method to increase score
        }
    }

    /**
     * Ends frightened mode, resetting all ghosts to SCATTER mode
     * and adjusting their speed to match SCATTER mode speed.
     */
    public void endFrightenedMode() {
        System.out.println("Frightened mode ended");
        isFrightenedActive = false;
        for (Renderable renderable : maze.getGhosts()) {
            if (renderable instanceof Ghost) {
                Ghost ghost = (Ghost) renderable;
                ghost.setGhostMode(GhostMode.SCATTER);
                ghost.setSpeed(ghostSpeeds.get(GhostMode.SCATTER));
            }
        }
    }
}
