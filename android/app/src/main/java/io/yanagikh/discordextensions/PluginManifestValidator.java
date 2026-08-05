package io.yanagikh.discordextensions;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.Locale;
import java.util.regex.Pattern;

public final class PluginManifestValidator {
    private static final Pattern ID_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9._-]{1,63}$");

    private PluginManifestValidator() {}

    public static ValidationResult validate(String rawJson) {
        try {
            JSONObject manifest = new JSONObject(rawJson);
            String id = requiredString(manifest, "id").toLowerCase(Locale.ROOT);
            if (!ID_PATTERN.matcher(id).matches()) {
                return ValidationResult.invalid("Invalid plugin id.");
            }

            requiredString(manifest, "name");
            requiredString(manifest, "version");
            requiredString(manifest, "description");
            requiredString(manifest, "author");
            requiredString(manifest, "entry");

            JSONArray permissions = manifest.optJSONArray("permissions");
            JSONArray settings = manifest.optJSONArray("settings");
            if (permissions == null || settings == null) {
                return ValidationResult.invalid("permissions and settings must be arrays.");
            }

            return ValidationResult.valid(id, manifest);
        } catch (JSONException exception) {
            return ValidationResult.invalid(exception.getMessage() == null ? "Invalid JSON." : exception.getMessage());
        }
    }

    private static String requiredString(JSONObject object, String key) throws JSONException {
        String value = object.getString(key).trim();
        if (value.isEmpty()) {
            throw new JSONException("Missing required field: " + key);
        }
        return value;
    }

    public static final class ValidationResult {
        public final boolean valid;
        public final String pluginId;
        public final String error;
        public final JSONObject manifest;

        private ValidationResult(boolean valid, String pluginId, String error, JSONObject manifest) {
            this.valid = valid;
            this.pluginId = pluginId;
            this.error = error;
            this.manifest = manifest;
        }

        public static ValidationResult valid(String pluginId, JSONObject manifest) {
            return new ValidationResult(true, pluginId, "", manifest);
        }

        public static ValidationResult invalid(String error) {
            return new ValidationResult(false, "", error, null);
        }
    }
}
