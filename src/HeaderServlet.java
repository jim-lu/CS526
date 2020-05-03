import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Date;

@WebServlet("/HeaderServlet")
public class HeaderServlet extends HttpServlet {
    private DatabaseUtils databaseUtils = new DatabaseUtils();
    private MessageDigest md;

    public void doGet(HttpServletRequest request, HttpServletResponse response) {
        String methodName = request.getParameter("method");
        Class c = this.getClass();
        try {
            Method method = c.getMethod(methodName, HttpServletRequest.class, HttpServletResponse.class);
            method.invoke(this, request, response);
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
    }

    public void doPost(HttpServletRequest request, HttpServletResponse response) {
        String methodName = request.getParameter("method");
        Class c = this.getClass();
        try {
            Method method = c.getMethod(methodName, HttpServletRequest.class, HttpServletResponse.class);
            method.invoke(this, request, response);
        } catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
            e.printStackTrace();
        }
    }

    public void doRegister(HttpServletRequest request, HttpServletResponse response) throws NoSuchAlgorithmException, ServletException, IOException {
        databaseUtils.connect();
        md = MessageDigest.getInstance("MD5");
        String username = request.getParameter("unamer");
        String pwd = request.getParameter("pswr");
        md.update(pwd.getBytes());
        String hashedPWD = new BigInteger(1, md.digest()).toString(16);
        Date date = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("YYYY-MM-dd");
        String currDate = dateFormat.format(date);
        databaseUtils.executeUpdate("INSERT INTO users (username, pwd, signup_date, last_login_date) VALUES ('" +
                username + "','" + hashedPWD + "','" + currDate + "','" + currDate + "')");
        JSONArray jsonArray = databaseUtils.executeSql("SELECT id FROM users WHERE username='" + username + "' AND pwd='" + hashedPWD + "'");
        databaseUtils.close();
        JSONObject obj = new JSONObject();
        obj.put("status", 1);
        obj.put("id", jsonArray.getJSONObject(0).getJSONArray("resultSet").getJSONObject(0).get("id"));
        response.getWriter().write(obj.toString());
    }

    public void doLogin(HttpServletRequest request, HttpServletResponse response) throws NoSuchAlgorithmException, ServletException, IOException {
        databaseUtils.connect();
        MessageDigest md = MessageDigest.getInstance("MD5");
        String username = request.getParameter("unamel");
        String pwd = request.getParameter("pswl");
        md.update(pwd.getBytes());
        String hashedPWD = new BigInteger(1, md.digest()).toString(16);
        Date date = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("YYYY-MM-dd");
        String currDate = dateFormat.format(date);
        JSONArray jsonArray = databaseUtils.executeSql("SELECT id, username FROM users WHERE username='" + username +
                "' AND pwd='" + hashedPWD + "'");
        JSONObject obj = new JSONObject();
        if (jsonArray.getJSONObject(0).getJSONArray("resultSet").length() > 0) {
            databaseUtils.executeUpdate("UPDATE users SET last_login_date='" + currDate + "' WHERE username='" + username +
                    "' AND pwd='" + hashedPWD + "'");
            obj.put("status", 1);
            obj.put("id", jsonArray.getJSONObject(0).getJSONArray("resultSet").getJSONObject(0).get("id"));
        } else {
            obj.put("status", 0);
        }
        databaseUtils.close();
        response.getWriter().write(obj.toString());
    }

    public void getStates(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT state_name, state_po FROM states");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }
}
