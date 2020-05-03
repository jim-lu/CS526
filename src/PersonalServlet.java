import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.text.SimpleDateFormat;
import java.util.Date;

@WebServlet("/PersonalServlet")
public class PersonalServlet extends HttpServlet {
    private DatabaseUtils databaseUtils = new DatabaseUtils();

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

    public void getSitePollsForUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String userId = request.getParameter("userId");
        databaseUtils.connect();
        JSONArray sitePollArray = databaseUtils.executeSql("SELECT id, poll_name, labels, poll_description FROM site_poll WHERE show_table=1");
        JSONArray idArray = databaseUtils.executeSql("SELECT poll_id FROM site_poll_data WHERE user_id=" + userId);
        databaseUtils.close();
        JSONArray resultArray = new JSONArray();
        resultArray.put(sitePollArray);
        resultArray.put(idArray);
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(resultArray);
        out.flush();
        out.close();
    }

    public void getSitePollData(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT * FROM site_poll_data LEFT JOIN (" +
                "SELECT id, poll_name, show_table FROM site_poll) s ON site_poll_data.poll_id=s.id WHERE show_table=1");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }


    public void doCastVote(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String value = request.getParameter("poll").replace('-', ' ');
        String userId = request.getParameter("user");
        String pollId = request.getParameter("id");
        Date date = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("YYYY-MM-dd");
        String currDate = dateFormat.format(date);
        databaseUtils.connect();
        databaseUtils.executeUpdate("INSERT INTO site_poll_data (poll_id, user_id, stand, vote_date) VALUES (" +
                pollId + "," + userId + "," + value + "," + currDate + ")");
        databaseUtils.close();
        JSONObject obj = new JSONObject();
        obj.put("status", 1);
        response.getWriter().write(obj.toString());
    }

    public void download(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        String filepath = "C:\\Jim's File\\DIVA\\";
        String filename = "state_poll_data.zip";
        response.setContentType("APPLICATION/OCTET-STREAM");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        FileInputStream fileInputStream = new FileInputStream(filepath + filename);
        int line;
        while ((line=fileInputStream.read()) != -1) out.write(line);
        fileInputStream.close();
        out.close();
    }
}
