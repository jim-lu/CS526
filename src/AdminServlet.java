import org.json.JSONArray;
import org.json.JSONObject;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

@WebServlet("/AdminServlet")
public class AdminServlet extends HttpServlet {
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

    public void addSitePoll(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pollName = request.getParameter("pollName");
        String label = request.getParameter("label");
        String description = request.getParameter("description");
        databaseUtils.connect();
        databaseUtils.executeUpdate("INSERT INTO site_poll (poll_name, poll_description, labels) VALUES ('" + pollName + "','" + description + "','" + label +"')");
        databaseUtils.close();
        JSONObject obj = new JSONObject();
        obj.put("url", "admin.jsp?tab=poll");
        response.getWriter().write(obj.toString());
    }

    public void updateSitePollStatus(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String id = request.getParameter("id");
        String status = request.getParameter("status");
        databaseUtils.connect();
        databaseUtils.executeUpdate("UPDATE site_poll SET show_table=" + status + " WHERE id=" + id);
        databaseUtils.close();
        JSONObject obj = new JSONObject();
        obj.put("url", "admin.jsp?tab=poll");
        response.getWriter().write(obj.toString());
    }

    public void getAllTableNames(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT table_name FROM information_schema.tables WHERE table_schema=\"game_of_polls\"");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void getTableData(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String table = request.getParameter("tableName");
        int page = Integer.parseInt(request.getParameter("page"));
        databaseUtils.connect();
        JSONArray jsonArray = new JSONArray();
        JSONArray dataArray = databaseUtils.executeSql("SELECT * FROM " + table + " LIMIT " + (page - 1) * 10 + ",10");
        JSONArray totalArray = databaseUtils.executeSql("SELECT COUNT(*) FROM " + table);
        jsonArray.put(dataArray);
        jsonArray.put(totalArray);
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void getSitePolls(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT id, poll_name, show_table FROM site_poll");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void getSitePollData(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String pollId = request.getParameter("pollId");
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT * FROM site_poll_data WHERE poll_id=" + pollId);
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void getUserActivityRecord(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray newUserRecordArray = databaseUtils.executeSql("SELECT * FROM new_user_record");
        JSONArray activeUserRecordArray = databaseUtils.executeSql("SELECT * FROM active_user_record");
        JSONArray jsonArray = new JSONArray();
        jsonArray.put(newUserRecordArray);
        jsonArray.put(activeUserRecordArray);
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
