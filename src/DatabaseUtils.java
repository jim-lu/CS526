import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.List;
import java.util.Map;

public class DatabaseUtils {
    private Connection connection = null;
    private String DB_NAME = "game_of_polls";
    private String USERNAME = "root";
    private String PASSWORD = "960503";
    private String HOSTNAME = "localhost";
    private String PORT = "3306";

    public void connect() {
        try {
            Class.forName("com.mysql.jdbc.Driver");
            connection = DriverManager.getConnection("jdbc:mysql://" + HOSTNAME + ":" + PORT + "/" + DB_NAME + "?user=" + USERNAME + "&password=" + PASSWORD + "&userSSL=false");
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
        }
    }

    public void close() {
        if (connection != null) {
            try {
                connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public JSONArray batchInsertData(String sql, List<Map<String, String>> records) {
        JSONArray json = new JSONArray();
        JSONObject obj = new JSONObject();
        try {
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            connection.setAutoCommit(false);
            for (Map<String, String> record : records) {
                int j = 1;
                for (String val : record.values()) {
                    preparedStatement.setString(j++, val);
                }
                preparedStatement.addBatch();
            }
            int[] result = preparedStatement.executeBatch();
            obj.put("insertedNum", result.length);
            connection.commit();
        } catch (SQLException e) {
            e.printStackTrace();
            obj.put("error", 0);
        }
        json.put(obj);
        return json;
    }

    public void batchInsertPollster(String sql, List<String> pollster) {
        try {
            PreparedStatement preparedStatement = connection.prepareStatement(sql);
            connection.setAutoCommit(false);
            for (String s : pollster) {
                preparedStatement.setString(1, s);
                preparedStatement.addBatch();
            }
            preparedStatement.executeBatch();
            connection.commit();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public JSONArray executeSql(String sql) {
        JSONArray json = new JSONArray();
        JSONObject obj = new JSONObject();
        try {
            Statement setupStatement = connection.createStatement();
            ResultSet rs = setupStatement.executeQuery(sql);
            json = resultSetConvert(rs);
            setupStatement.close();
        } catch (SQLException e) {
            e.printStackTrace();
            obj.put("msg", "There is a mistake in sql!");
            json.put(obj);
        }
        return json;
    }

    public void executeUpdate(String sql) {
        try {
            Statement setupStatement = connection.createStatement();
            setupStatement.executeUpdate(sql);
            setupStatement.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public JSONArray resultSetConvert(ResultSet rs) throws SQLException {
        JSONArray json = new JSONArray();
        ResultSetMetaData metaData = rs.getMetaData();
        JSONObject obj = new JSONObject();
        JSONArray results = new JSONArray();
        while (rs.next()) {
            int numColumns = metaData.getColumnCount();
            JSONObject resultSetObj = new JSONObject();
            for (int i = 1; i <= numColumns; i ++) {
                String columnName = metaData.getColumnName(i);
                if (metaData.getColumnType(i) == Types.INTEGER) {
                    resultSetObj.put(columnName, rs.getInt(columnName));
                } else if (metaData.getColumnType(i) == Types.VARCHAR) {
                    resultSetObj.put(columnName, rs.getString(columnName));
                } else {
                    resultSetObj.put(columnName, rs.getObject(columnName));
                }
            }
            results.put(resultSetObj);
        }
        obj.put("resultSet", results);
        obj.put("msg", "Query completed!");
        json.put(obj);
        return json;
    }
}
