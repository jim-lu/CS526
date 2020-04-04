import org.json.JSONArray;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

@WebServlet("/PollServlet")
public class PollServlet extends HttpServlet {
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

    public void trumpJobApproval(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT * FROM president_job_approval");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void congressionalJobApproval(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT * FROM congressional_job_approval");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void directionOfCountry(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT * FROM country_direction");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void presidentImpeachment(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT * FROM president_impeachment");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void democraticNomination(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT * FROM democratic_nomination");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void publicanNomination(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT * FROM publican_nomination");
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void getStatePoll(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String statePO = request.getParameter("state");
        databaseUtils.connect();
        JSONArray resultArray = databaseUtils.executeSql("SELECT * FROM state_poll_final WHERE state='" + statePO + "'");
        JSONArray status = databaseUtils.executeSql("SELECT * FROM states WHERE state_po='" + statePO + "'");
        JSONArray jsonArray = new JSONArray();
        jsonArray.put(resultArray);
        jsonArray.put(status);
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
