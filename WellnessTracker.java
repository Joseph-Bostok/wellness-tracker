import java.awt.*;
import javax.swing.*;


public class buttonInterface extends JFrame {

    public buttonInterface(){
        setTitle("Wellness Tracker");

        setSize(900,700);

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        setLayout(new FlowLayout());

        JButton button1 = new JButton("Log Exercise");
        JButton button2 = new JButton("Log Nutrition");
        JButton button3 = new JButton("Log Sleep");


        add(button1);
        add(button2);
        add(button3);
        
        setVisible(true);
    }

    public static void main(String[] args) {
        new buttonInterface();
    }
}
