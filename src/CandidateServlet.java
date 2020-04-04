import org.json.JSONArray;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

@WebServlet("/CandidateServlet")
public class CandidateServlet extends HttpServlet {
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

    public void getCandidateInfo(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String id = request.getParameter("id");
        String[] name = request.getParameter("name").split(" ");
        String party = request.getParameter("party");
        String lastName = name[name.length - 1];
        JSONArray pollArray;
        databaseUtils.connect();
        JSONArray infoArray = databaseUtils.executeSql("SELECT * FROM candidates WHERE candidate_id=" + id);
        if (party.equals("1")) pollArray = databaseUtils.executeSql("SELECT * FROM democratic_nomination WHERE candidate='" + lastName + "'");
        else pollArray = databaseUtils.executeSql("SELECT * FROM publican_nomination WHERE candidate='" + lastName + "'");
        databaseUtils.close();
        JSONArray jsonArray = new JSONArray();
        jsonArray.put(infoArray);
        jsonArray.put(pollArray);
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }
}
