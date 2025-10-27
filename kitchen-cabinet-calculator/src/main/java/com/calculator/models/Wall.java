public class Wall {
    private double length;
    private List<Door> doors;
    private List<Window> windows;

    public Wall(double length) {
        this.length = length;
        this.doors = new ArrayList<>();
        this.windows = new ArrayList<>();
    }

    public double getLength() {
        return length;
    }

    public void addDoor(Door door) {
        doors.add(door);
    }

    public void addWindow(Window window) {
        windows.add(window);
    }

    public List<Door> getDoors() {
        return doors;
    }

    public List<Window> getWindows() {
        return windows;
    }
}