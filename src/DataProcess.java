import org.json.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import java.io.FileReader;
import java.io.IOException;
import java.util.*;

public class DataProcess {
    Map<String, String> binaryPollLink;
    Map<String, String> comparisonPollLink;
    Map<String, String> generalPollLink;
    Map<String, String> statePollLink;
    List<Map<String, String>> binaryPollData;
    List<Map<String, String>> comparisonPollData;
    List<Map<String, String>> generalPollData;
    List<Map<String, String>> statePollData;
    List<String> newPollster;

    /**
     * @param domain The domain address where the data comes from
     * @param table The table where the data being uploaded to
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param databaseUtils Database operation functions
     */
    public void processBinaryData(String domain, String table, Map<String, Integer> localCache, DatabaseUtils databaseUtils) {
        Calendar calendar = Calendar.getInstance();
        int currentMonth = calendar.get(Calendar.MONTH) + 1;
        for (String key: binaryPollLink.keySet()) {
            Elements trElements = getTableData(domain + binaryPollLink.get(key));
            if (trElements != null) {
                Elements columnName = trElements.get(0).select("th");
                String binaryVal0 = columnName.get(3).text();
                String binaryVal1 = columnName.get(4).text();
                org.json.JSONObject obj = getLatestRecord(table, databaseUtils);

                binaryPollData = new ArrayList<>();
                int startYear = calendar.get(Calendar.YEAR);
                processRow(localCache, currentMonth, trElements, obj, null, startYear, binaryPollData, 3, binaryVal0, binaryVal1);
                Collections.reverse(binaryPollData);
                uploadData(key, binaryPollData, databaseUtils);
                uploadPollster(newPollster, databaseUtils);
            }
        }
    }

    /**
     * @param domain The domain address where the data comes from
     * @param table The table where the data being uploaded to
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param databaseUtils Database operation functions
     */
    public void processComparisonData(String domain, String table, Map<String, Integer> localCache, DatabaseUtils databaseUtils) {
        Calendar calendar = Calendar.getInstance();
        int currentMonth = calendar.get(Calendar.MONTH) + 1;
        for (String key: comparisonPollLink.keySet()) {
            Elements trElements = getTableData(domain + comparisonPollLink.get(key));
            if (trElements != null) {
                Elements columnName = trElements.get(0).select("th");
                String candidate0 = columnName.get(4).text().substring(0, columnName.get(4).text().length() - 4);
                String candidate1 = columnName.get(5).text().substring(0, columnName.get(5).text().length() - 4);
                org.json.JSONObject obj = getLatestRecord(table, databaseUtils);

                comparisonPollData = new ArrayList<>();
                int startYear = calendar.get(Calendar.YEAR);
                processRow(localCache, currentMonth, trElements, obj, null, startYear, comparisonPollData, 3, candidate0, candidate1);
                Collections.reverse(comparisonPollData);
            }
        }
        uploadData("comparison", comparisonPollData, databaseUtils);
        uploadPollster(newPollster, databaseUtils);
    }

    /**
     * @param domain The domain address where the data comes from
     * @param table The table where the data being uploaded to
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param databaseUtils Database operation functions
     */
    public void processGeneralData(String domain, String table, Map<String, Integer> localCache, DatabaseUtils databaseUtils) {
        Calendar calendar = Calendar.getInstance();
        int currentMonth = calendar.get(Calendar.MONTH) + 1;
        for (String key: generalPollLink.keySet()) {
            Elements trElements = getTableData(domain + generalPollLink.get(key));
            if (trElements != null) {
                Elements columnName = trElements.get(0).select("th");
                org.json.JSONObject obj = getLatestRecord(table, databaseUtils);
                List<String> candidateList = new ArrayList<>();
                for (int i = 3; i < columnName.size() - 1; i ++) candidateList.add(columnName.get(i).text().trim());
                generalPollData = new ArrayList<>();
                int startYear = calendar.get(Calendar.YEAR);
                processRow(localCache, currentMonth, trElements, obj, candidateList, startYear, generalPollData, -1, null, null);
                Collections.reverse(generalPollData);
                uploadData(key, generalPollData, databaseUtils);
            }
        }
    }

    /**
     * @param domain The domain address where the data comes from
     * @param table The table where the data being uploaded to
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param databaseUtils Database operation functions
     */
    public void processStateData(String domain, String table, Map<String, Integer> localCache, DatabaseUtils databaseUtils) {
        Calendar calendar = Calendar.getInstance();
        int currentMonth = calendar.get(Calendar.MONTH) + 1;
        statePollData = new ArrayList<>();
        for (String key: statePollLink.keySet()) {
            if (statePollLink.get(key).length() == 0) continue;
            Elements trElements = getTableData(domain + generalPollLink.get(key));
            if (trElements != null) {
                Elements columnName = trElements.get(0).select("th");
                org.json.JSONObject obj = getLatestRecord(table, databaseUtils);
                List<String> candidateList = new ArrayList<>();
                for (int i = 3; i < columnName.size() - 1; i ++) candidateList.add(columnName.get(i).text().trim());

                int startYear = calendar.get(Calendar.YEAR);
                processRow(localCache, currentMonth, trElements, obj, candidateList, startYear, statePollData, -1, null, null);
            }
        }
        Collections.reverse(statePollData);
        uploadData("state_poll", generalPollData, databaseUtils);
    }

    /**
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param currentMonth Indicate the current month, used to keep track of the latest data
     * @param trElements Web page elements
     * @param obj JSON object that stores the newest data in the database
     * @param candidateList The candidates that are running
     * @param startYear Indicate the current year, used to keep track of the year of the data because the data from the web page doen't contain year
     * @param pollData List that stores processed data
     * @param pollIndex The index where the actual number come from. -1 indicates more than 2 columns contain value, in this case we should loop through them.
     * @param stand0 One of the values of binary or comparison data
     * @param stand1 One of the values of binary or comparison data
     */
    private void processRow(Map<String, Integer> localCache, int currentMonth, Elements trElements, org.json.JSONObject obj, List<String> candidateList, int startYear, List<Map<String, String>> pollData, int pollIndex, String stand0, String stand1) {
        int previousMonth = 12;
        int i = 2;
        boolean firstLine = true;
        newPollster = new ArrayList<>();
        if (trElements.get(1).hasClass("final")) i = 3;
        for (; i < trElements.size(); i ++) {
            Map<String, String> row = new HashMap<>();
            int candidateIndex = 3;
            Elements tdElements = trElements.get(i).select("td");
            String pollster = tdElements.get(0).select("a.normal_pollster_name").text();
            String date = tdElements.get(1).text();
            String[] dateSplit = date.split("/| - ");
            int month = Integer.parseInt(dateSplit[2]);
            if ((firstLine && currentMonth < month && month < 12) || (month == 12 && previousMonth < month)) {
                startYear --;
                firstLine = false;
            }
            previousMonth = month;
            if (localCache.size() == 0) localCache.put(pollster, 1);
            if (!checkPollsterExistence(localCache, pollster)) {
                int maxId = Collections.max(localCache.values());
                localCache.put(pollster, maxId + 1);
                newPollster.add(pollster);
            }
            if(checkDataExistence(obj, row, localCache, pollster)) break;
            if (tdElements.size() <= 3) break;
            String pollsterId = String.valueOf(localCache.get(pollster));

            row.put("pollster_id", pollsterId);
            row.put("date", date);
            row.put("year", Integer.toString(startYear));
            if (pollIndex == -1) {
                row.put("poll", tdElements.get(candidateIndex).text());
                row.put("candidate", candidateList.get(0));
            } else {
                row.put("poll", tdElements.get(pollIndex).text());
                row.put("stand", stand0);
            }
            pollData.add(row);

            if (pollIndex == -1) {
                for (int j = 1; j < candidateList.size(); j++) {
                    candidateIndex++;
                    row.put("poll", tdElements.get(candidateIndex).text());
                    row.put("candidate", candidateList.get(j));
                }
            } else {
                row.put("poll", tdElements.get(pollIndex + 1).text());
                row.put("stand", stand1);
            }
            pollData.add(row);
        }
    }

    /**
     * @param link The link where the data comes from
     * @return Table elements
     */
    public Elements getTableData(String link) {
        try {
            Connection.Response response = Jsoup.connect(link).execute();
            Document document = Jsoup.parse(response.body());
            Elements tableElements = document.select("table.data");
            Elements trElements;
            if (tableElements.size() == 1) {
                trElements = tableElements.get(0).select("tr");
            } else {
                trElements = tableElements.get(1).select("tr");
            }
            return trElements;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void getMap() {
        try {
            Object obj = new JSONParser().parse(new FileReader("./resource/crawler_map.json"));
            JSONObject jsonObject = (JSONObject) obj;
            JSONObject bin = (JSONObject) jsonObject.get("bin");
            JSONObject comparison = (JSONObject) jsonObject.get("comparison");
            JSONObject general = (JSONObject) jsonObject.get("general");
            JSONObject state = (JSONObject) jsonObject.get("state");

            binaryPollLink = new HashMap<>();
            comparisonPollLink = new HashMap<>();
            generalPollLink = new HashMap<>();
            statePollLink = new HashMap<>();

            for (Object key: bin.keySet()) binaryPollLink.put((String) key, (String) bin.get(key));
            for (Object key: comparison.keySet()) comparisonPollLink.put((String) key, (String) comparison.get(key));
            for (Object key: general.keySet()) generalPollLink.put((String) key, (String) general.get(key));
            for (Object key: state.keySet()) statePollLink.put((String) key, (String) state.get(key));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * @param object JSON object that stores the newest data in the database
     * @param row Current row of data that needs to be checked
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param pollster Pollster name
     * @return Whether the data already exists
     */
    public boolean checkDataExistence(org.json.JSONObject object, Map<String, String> row, Map<String, Integer> localCache, String pollster) {
        int pollsterId =  localCache.get(pollster);
        return object.getInt("pollster_id") == pollsterId && object.getString("date").equals(row.get("date")) && object.getString("year").equals(row.get("year"));
    }

    /**
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param key Pollster name
     * @return Whether the pollster already exists
     */
    public boolean checkPollsterExistence(Map<String, Integer> localCache, String key) {
        return localCache.containsKey(key);
    }

    /**
     * @param table Table name
     * @param databaseUtils Database operation functions
     * @return JSON object that stores the latest record in the database
     */
    public org.json.JSONObject getLatestRecord(String table, DatabaseUtils databaseUtils) {
        String sql = "SELECT pollster_id, date, year FROM " + table + " WHERE id=(SELECT MAX(id) FROM " + table + ")";
        JSONArray jsonArray = databaseUtils.executeSql(sql);
        return jsonArray.getJSONObject(0).getJSONArray("resultSet").getJSONObject(0);
    }

    /**
     * @param table The table where the data is being uploaded to
     * @param records Data
     * @param databaseUtils Database operation functions
     * @return JSON object that indicate whether the operation succeeded
     */
    public JSONArray uploadData(String table, List<Map<String, String>> records, DatabaseUtils databaseUtils) {
        StringBuilder titleString = new StringBuilder();
        StringBuilder questionMarkString = new StringBuilder();
        for (String key: records.get(0).keySet()) {
            titleString.append(key).append(",");
            questionMarkString.append("?,");
        }
        String sql = "INSERT INTO " + table + " (" + titleString.toString().substring(0, titleString.length() - 1) + ") VALUES (" + questionMarkString.toString().substring(0, questionMarkString.length() - 1) + ")";
        return databaseUtils.batchInsertData(sql, records);
    }

    /**
     * @param pollster Pollsters that will be uploaded
     * @param databaseUtils Database operation functions
     */
    public void uploadPollster(List<String> pollster, DatabaseUtils databaseUtils) {
        String sql = "INSERT INTO pollster (pollster_name) VALUES (?)";
        databaseUtils.batchInsertPollster(sql, pollster);
    }

//    public static void main(String[] args) {
//        DataProcess dp = new DataProcess();
//        dp.getMap();
//        Map<String, String> map = new HashMap<>();
//        map.put("date", "111");
//        map.put("year", "222");
//        List<Map<String, String>> list = new ArrayList<>();
//        list.add(map);
//        JSONArray json = dp.uploadData("table", list, new DatabaseUtils());
//    }
}
