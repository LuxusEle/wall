public class Window {
    private double width;
    private double height;
    private double distanceFromLeft;

    public Window(double width, double height, double distanceFromLeft) {
        this.width = width;
        this.height = height;
        this.distanceFromLeft = distanceFromLeft;
    }

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public double getDistanceFromLeft() {
        return distanceFromLeft;
    }

    public void setDistanceFromLeft(double distanceFromLeft) {
        this.distanceFromLeft = distanceFromLeft;
    }
}