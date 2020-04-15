import org.json.JSONArray;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

@WebServlet("/HistoryServlet")
public class HistoryServlet extends HttpServlet {
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

    public void getLastElectionPoll(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray resultArray = databaseUtils.executeSql("SELECT * FROM past_election_by_county WHERE election_year='2016'");
        JSONArray states = databaseUtils.executeSql("SELECT state_name, state_po, state_fips FROM states");
        JSONArray jsonArray = new JSONArray();
        jsonArray.put(resultArray);
        jsonArray.put(states);
        databaseUtils.close();
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void getYearList(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        JSONArray jsonArray = databaseUtils.executeSql("SELECT DISTINCT(election_year) FROM game_of_polls.history_election");
        PrintWriter out = response.getWriter();
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter();
        out.println(jsonArray);
        out.flush();
        out.close();
    }

    public void getPastElectionPoll(HttpServletRequest request, HttpServletResponse response) throws IOException {
        databaseUtils.connect();
        String year = request.getParameter("year");
        JSONArray jsonArray = databaseUtils.executeSql(
                "SELECT * FROM history_election " +
                        "LEFT JOIN (select state_name, state_po, state_fips from game_of_polls.states) s " +
                        "ON history_election.state_fips=s.state_fips WHERE election_year='" + year + "'"
        );
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
