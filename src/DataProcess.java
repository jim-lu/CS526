import org.json.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import java.io.BufferedReader;
import java.io.BufferedWriter;
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
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param databaseUtils Database operation functions
     */
    public void processBinaryData(String domain, Map<String, Integer> localCache, DatabaseUtils databaseUtils) {
        Calendar calendar = Calendar.getInstance();
        int currentMonth = calendar.get(Calendar.MONTH) + 1;
        for (String key: binaryPollLink.keySet()) {
            Elements trElements = getTableData(domain + binaryPollLink.get(key));
            if (trElements != null) {
                Elements columnName = trElements.get(0).select("th");
                String binaryVal0 = columnName.get(3).text().trim();
                String binaryVal1 = columnName.get(4).text().trim();
                org.json.JSONObject obj = getLatestRecord(key, databaseUtils, "");
                binaryPollData = new ArrayList<>();
                int startYear = calendar.get(Calendar.YEAR);
                processRow(localCache, currentMonth, trElements, obj, null, startYear, binaryPollData, 3, binaryVal0, binaryVal1, null, databaseUtils);
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
                org.json.JSONObject obj = getLatestRecord(table, databaseUtils, "");
                comparisonPollData = new ArrayList<>();
                int startYear = calendar.get(Calendar.YEAR);
                processRow(localCache, currentMonth, trElements, obj, null, startYear, comparisonPollData, 3, candidate0, candidate1, null, databaseUtils);
                Collections.reverse(comparisonPollData);
            }
        }
        uploadData("comparison", comparisonPollData, databaseUtils);
        uploadPollster(newPollster, databaseUtils);
    }

    /**
     * @param domain The domain address where the data comes from
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param databaseUtils Database operation functions
     */
    public void processGeneralData(String domain, Map<String, Integer> localCache, DatabaseUtils databaseUtils) {
        Calendar calendar = Calendar.getInstance();
        int currentMonth = calendar.get(Calendar.MONTH) + 1;
        for (String key: generalPollLink.keySet()) {
            Elements trElements = getTableData(domain + generalPollLink.get(key));
            if (trElements != null) {
                Elements columnName = trElements.get(0).select("th");
                org.json.JSONObject obj = getLatestRecord(key, databaseUtils, "");
                List<String> candidateList = new ArrayList<>();
                for (int i = 3; i < columnName.size() - 1; i ++) candidateList.add(columnName.get(i).text().trim());
                generalPollData = new ArrayList<>();
                int startYear = calendar.get(Calendar.YEAR);
                processRow(localCache, currentMonth, trElements, obj, candidateList, startYear, generalPollData, -1, null, null, null, databaseUtils);
                Collections.reverse(generalPollData);
                uploadData(key, generalPollData, databaseUtils);
                uploadPollster(newPollster, databaseUtils);
            }
        }
    }

    /**
     * @param domain The domain address where the data comes from
     * @param localCache The localCache stores the pollster information, can be used to keep track of new pollsters and latest data (Needs further implementation)
     * @param databaseUtils Database operation functions
     */
    public void processStateData(String domain, Map<String, Integer> localCache, DatabaseUtils databaseUtils) {
        Calendar calendar = Calendar.getInstance();
        int currentMonth = calendar.get(Calendar.MONTH) + 1;
        statePollData = new ArrayList<>();
        newPollster = new ArrayList<>();
        for (String key: statePollLink.keySet()) {
            if (statePollLink.get(key).length() == 0) continue;
            Elements trElements = getTableData(domain + statePollLink.get(key));
            if (trElements != null) {
                Elements columnName = trElements.get(0).select("th");
                org.json.JSONObject obj = getLatestRecord("state_poll", databaseUtils, key);
                List<String> candidateList = new ArrayList<>();
                for (int i = 3; i < columnName.size() - 1; i ++) candidateList.add(columnName.get(i).text().trim());
                int startYear = calendar.get(Calendar.YEAR);
                processRow(localCache, currentMonth, trElements, obj, candidateList, startYear, statePollData, -1, null, null, key, databaseUtils);
                if (statePollData.size() > 0) System.out.println(statePollData.get(0).size());
            }
        }
        Collections.reverse(statePollData);
        uploadData("state_poll", statePollData, databaseUtils);
        uploadPollster(newPollster, databaseUtils);
    }

    public void processFinalData(String domain, Set<String> localCache, DatabaseUtils databaseUtils) {
        statePollData = new ArrayList<>();
        for (String key: statePollLink.keySet()) {
            if (statePollLink.get(key).length() == 0 || localCache.contains(key)) continue;
            Elements trElements = getTableData(domain + statePollLink.get(key));
            if (trElements != null) {
                Elements columnName = trElements.get(0).select("th");
                List<String> candidateList = new ArrayList<>();
                for (int i = 3; i < columnName.size() - 1; i ++) candidateList.add(columnName.get(i).text().trim());
                if (!trElements.get(1).hasClass("final")) continue;
                Elements tdElements = trElements.get(1).select("td");
                HashMap<String, String> row;
                int candidateIndex = 3;
                for (String candidate: candidateList) {
                    String poll = tdElements.get(candidateIndex ++).text().trim();
                    row = new HashMap<>();
                    row.put("state", key);
                    row.put("poll", poll);
                    row.put("candidate", candidate);
                    statePollData.add(row);
                }
            }
        }
        uploadData("state_poll_final", statePollData, databaseUtils);
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
     * @param state Indicate a state poll
     */
    private void processRow(Map<String, Integer> localCache, int currentMonth, Elements trElements, org.json.JSONObject obj, List<String> candidateList, int startYear, List<Map<String, String>> pollData, int pollIndex, String stand0, String stand1, String state, DatabaseUtils databaseUtils) {
        int previousMonth = 12, i = 2;
        boolean firstLine = true, end = false;
        System.out.println(state + " " + state.length());
        if (trElements.get(1).hasClass("final") && state != null) updateFinalStatus(state, databaseUtils);
        for (; i < trElements.size(); i ++) {
            if (end) break;
            if (trElements.get(i).hasClass("rcpAvg") || trElements.get(i).hasClass("rcpAvg2")) continue;
            HashMap<String, String> row;
            int candidateIndex = 3;
            Elements tdElements = trElements.get(i).select("td");
            if (tdElements.size() < 5) break;
            String pollster = tdElements.get(0).select("a.normal_pollster_name").text().trim();
            String date = tdElements.get(1).text().trim();
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
            if (tdElements.size() <= 3) break;
            String pollsterId = String.valueOf(localCache.get(pollster));
            if (pollIndex == -1) {
                for (String candidate : candidateList) {
                    String poll = tdElements.get(candidateIndex ++).text().trim();
                    row = new HashMap<>();
                    row.put("pollster_id", pollsterId);
                    row.put("poll_date", date);
                    row.put("poll_year", Integer.toString(startYear));
                    row.put("poll", poll);
                    row.put("candidate", candidate);
                    if (state != null) row.put("state", state);
                    if (obj != null && checkDataExistence(obj, row, localCache, pollster)) {
                        end = true;
                        break;
                    }
                    pollData.add(row);
                }
            } else {
                for (int j = 0; j < 2; j ++) {
                    String poll = tdElements.get(candidateIndex + i).text().trim();
                    row = new HashMap<>();
                    row.put("pollster_id", pollsterId);
                    row.put("poll_date", date);
                    row.put("poll_year", Integer.toString(startYear));
                    row.put("poll", poll);
                    row.put("stand", j == 0 ? stand0 : stand1);
                    if(obj != null && checkDataExistence(obj, row, localCache, pollster)) {
                        end = true;
                        break;
                    }
                    pollData.add(row);
                }
            }
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

    public void processNominationCSV(String file, String table, Map<String, Integer> localCache, List<Map<String, String>> pollData, DatabaseUtils databaseUtils) throws IOException {
        BufferedReader br = new BufferedReader(new FileReader(file));
        String line = br.readLine();
        String[] lineArr = line.split(",");
        List<String> candidateList = new ArrayList<>(Arrays.asList(lineArr).subList(3, 14));
        newPollster = new ArrayList<>();
        pollData = new ArrayList<>();
        while ((line = br.readLine()) != null) {
            lineArr = line.split(",");
            String pollster = lineArr[0], date = lineArr[1], year = lineArr[15];
            Map<String, String> row;
            if (!checkPollsterExistence(localCache, pollster)) {
                int maxId = Collections.max(localCache.values());
                localCache.put(pollster, maxId + 1);
                newPollster.add(pollster);
            }
            for (int i = 3; i < 14; i ++) {
                if (lineArr[i].equals("--")) continue;
                row = new HashMap<>();
                row.put("pollster_id", String.valueOf(localCache.get(pollster)));
                row.put("poll_date", date);
                row.put("poll_year", year);
                row.put("poll", lineArr[i]);
                row.put("candidate", candidateList.get(i - 3));
                pollData.add(row);
            }
        }
        Collections.reverse(pollData);
        uploadData(table, pollData, databaseUtils);
        uploadPollster(newPollster, databaseUtils);
    }

    public void processPresident2016CSV(DatabaseUtils databaseUtils) throws IOException {
        String fileName = "./resource/20161108__us__general__president__county.csv";
        BufferedReader br = new BufferedReader(new FileReader(fileName));
        String line;
        String[] lineArr;
        List<Map<String, String>> pollData = new ArrayList<>();
        while ((line = br.readLine()) != null) {
            lineArr = line.split(",");
            Map<String, String> row = new HashMap<>();
            row.put("state", lineArr[0]);
            row.put("county", lineArr[1]);
            row.put("party", lineArr[2]);
            row.put("candidate", lineArr[3]);
            row.put("votes", lineArr[4]);
            pollData.add(row);
        }
        uploadData("general_president_2016", pollData, databaseUtils);
    }

    public void processPastElectionByCountyCSV(DatabaseUtils databaseUtils) throws IOException {
        String fileName = "./resource/countypres_2000-2016.csv";
        BufferedReader br = new BufferedReader(new FileReader(fileName));
        String line = br.readLine();
        String[] lineArr;
        List<Map<String, String>> counties = new ArrayList<>();
        while ((line = br.readLine()) != null) {
            lineArr = line.split(",");
            Map<String, String> row = new HashMap<>();
            row.put("election_year", lineArr[0]);
            row.put("state_po", lineArr[2]);
            row.put("county_name", lineArr[3]);
            row.put("county_fips", lineArr[4]);
            row.put("candidate", lineArr[6]);
            row.put("party", lineArr[7]);
            row.put("candidate_vote", lineArr[8]);
            row.put("total_vote", lineArr[9]);
            counties.add(row);
        }
        uploadData("past_election_by_county", counties, databaseUtils);
    }

    public void processHistoryElectionCSV(DatabaseUtils databaseUtils) throws IOException {
        String fileName = "./resource/1976-2016-president.csv";
        BufferedReader br = new BufferedReader(new FileReader(fileName));
        String line = br.readLine();
        String[] lineArr;
        List<Map<String, String>> states = new ArrayList<>();
        while ((line = br.readLine()) != null) {
            lineArr = line.split(",(?=([^\\\"]*\\\"[^\\\"]*\\\")*[^\\\"]*$)");
            Map<String, String> row = new HashMap<>();
            row.put("election_year", lineArr[0]);
            row.put("state_fips", lineArr[3]);
            row.put("candidate", lineArr[6].length() > 0 ? lineArr[6].replace("\"", "") : "Other");
            row.put("party", lineArr[7]);
            row.put("candidate_vote", lineArr[9]);
            row.put("total_vote", lineArr[10]);
            states.add(row);
        }
        uploadData("history_election", states, databaseUtils);
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
        return object.getInt("pollster_id") == pollsterId && object.getString("poll_date").equals(row.get("poll_date")) && object.getString("poll_year").equals(row.get("poll_year"));
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
    public org.json.JSONObject getLatestRecord(String table, DatabaseUtils databaseUtils, String state) {
        String sql;
        if (state.length() > 0) {
            sql = "SELECT pollster_id, poll_date, poll_year FROM (SELECT * FROM " + table + " WHERE state='" + state + "') t";
        } else {
            sql = "SELECT pollster_id, poll_date, poll_year FROM " + table + " WHERE pollster_id=(SELECT MAX(pollster_id) FROM " + table + ")";
        }
        JSONArray jsonArray = databaseUtils.executeSql(sql);
        JSONArray resultSet = jsonArray.getJSONObject(0).getJSONArray("resultSet");
        if (resultSet.length() == 0) return null;
        return resultSet.getJSONObject(0);
    }

    public void updateFinalStatus(String state, DatabaseUtils databaseUtils) {
        String sql = "UPDATE states SET final=1 WHERE state_po='" + state + "'";
        databaseUtils.executeUpdate(sql);
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
        System.out.println(sql);
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

    public void getPollster(Map<String, Integer> localCache, DatabaseUtils databaseUtils) {
        String sql = "SELECT * FROM pollster";
        JSONArray json = databaseUtils.executeSql(sql);
        JSONArray resultSet = json.getJSONObject(0).getJSONArray("resultSet");
        for (int i = 0; i < resultSet.length(); i ++) {
            localCache.put(resultSet.getJSONObject(i).getString("pollster_name"), resultSet.getJSONObject(i).getInt("pollster_id"));
        }
    }

    public void getExistingFinalState(Set<String> localCache, DatabaseUtils databaseUtils) {
        String sql = "SELECT state FROM state_poll_final";
        JSONArray json = databaseUtils.executeSql(sql);
        JSONArray resultSet = json.getJSONObject(0).getJSONArray("resultSet");
        for (int i = 0; i < resultSet.length(); i ++) {
            System.out.println(resultSet.getJSONObject(i).getString("state"));
            localCache.add(resultSet.getJSONObject(i).getString("state"));
        }
    }

    public static void main(String[] args) throws IOException {
        DataProcess dp = new DataProcess();
        DatabaseUtils du = new DatabaseUtils();
        dp.getMap();
        Map<String, Integer> map = new HashMap<>();
        du.connect();
//        dp.getPollster(map, du);
//        dp.processBinaryData("https://www.realclearpolitics.com/epolls/", map, du);
//        dp.processNominationCSV("./resource/democratic_presidential_nomination.csv", "democratic_nomination", map, dp.generalPollData, du);
//        dp.processGeneralData("https://www.realclearpolitics.com/epolls/", map, du);
//        dp.processStateData("https://www.realclearpolitics.com/epolls/", map, du);
//        dp.processPresident2016CSV(du);


//        Set<String> set = new HashSet<>();
//        dp.getExistingFinalState(set, du);
//        dp.processFinalData("https://www.realclearpolitics.com/epolls/", set, du);

//        dp.processPastElectionByCountyCSV(du);
        dp.processHistoryElectionCSV(du);
        du.close();
    }
}
