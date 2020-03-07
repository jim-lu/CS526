import org.json.JSONObject;

import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

public class LocalCache {
    private static final int TIMEOUT = 3600;
    private static Map<String, Integer> map;
    private static Timer timer;

    static {
        timer = new Timer();
        map = new ConcurrentHashMap<>();
    }

    private static void remove(String key) {
        map.remove(key);
    }

    static class CleanWorkerTask extends TimerTask {
        private String key;
        CleanWorkerTask(String key) {
            this.key = key;
        }
        public void run() {
            LocalCache.remove(key);
        }
    }

    public static void put(String key, Integer value) {
        map.put(key, value);
        timer.schedule(new CleanWorkerTask(key), TIMEOUT);
    }

    public Map<String, Integer> getMap() {
        return map;
    }
}
