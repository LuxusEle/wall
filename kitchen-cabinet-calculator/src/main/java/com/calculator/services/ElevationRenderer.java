public class ElevationRenderer {
    
    public String renderElevation(Wall wall) {
        StringBuilder elevation = new StringBuilder();
        elevation.append("Elevation Plan:\n");
        elevation.append("Wall Length: ").append(wall.getLength()).append("\n");
        
        for (Door door : wall.getDoors()) {
            elevation.append("Door - Width: ").append(door.getWidth())
                     .append(", Height: ").append(door.getHeight())
                     .append(", Distance from Left: ").append(door.getDistanceFromLeft()).append("\n");
        }
        
        for (Window window : wall.getWindows()) {
            elevation.append("Window - Width: ").append(window.getWidth())
                     .append(", Height: ").append(window.getHeight())
                     .append(", Distance from Left: ").append(window.getDistanceFromLeft()).append("\n");
        }
        
        return elevation.toString();
    }
}