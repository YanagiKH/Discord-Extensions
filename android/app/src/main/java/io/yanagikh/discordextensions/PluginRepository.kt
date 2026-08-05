package io.yanagikh.discordextensions

import android.content.Context
import android.net.Uri
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.nio.charset.StandardCharsets
import java.util.zip.ZipInputStream

data class PluginSummary(
    val id: String,
    val name: String,
    val version: String,
    val description: String,
    val enabled: Boolean,
)

class PluginRepository(private val context: Context) {
    private val pluginsRoot = File(context.filesDir, "plugins")
    private val preferences = context.getSharedPreferences("plugin-state", Context.MODE_PRIVATE)

    init {
        pluginsRoot.mkdirs()
        ensureBuiltIns()
    }

    fun listPlugins(): List<PluginSummary> = pluginsRoot.listFiles()
        .orEmpty()
        .filter { it.isDirectory }
        .mapNotNull { directory ->
            runCatching {
                val manifestFile = File(directory, "plugin.json")
                val manifest = JSONObject(manifestFile.readText(StandardCharsets.UTF_8))
                PluginSummary(
                    id = manifest.getString("id"),
                    name = manifest.getString("name"),
                    version = manifest.getString("version"),
                    description = manifest.optString("description"),
                    enabled = preferences.getBoolean(manifest.getString("id"), false),
                )
            }.getOrNull()
        }
        .sortedBy { it.name.lowercase() }

    fun setEnabled(pluginId: String, enabled: Boolean) {
        preferences.edit().putBoolean(pluginId, enabled).apply()
        DebugLogStore.append(context, "Plugin $pluginId enabled=$enabled")
    }

    fun importFromUri(uri: Uri): PluginSummary {
        val displayName = queryDisplayName(uri).lowercase()
        val staging = File(context.cacheDir, "import-${System.nanoTime()}")
        staging.deleteRecursively()
        staging.mkdirs()

        try {
            if (displayName.endsWith(".zip")) {
                context.contentResolver.openInputStream(uri).use { input ->
                    requireNotNull(input) { "Unable to open the selected ZIP file." }
                    ZipInputStream(input).use { zip ->
                        var entry = zip.nextEntry
                        while (entry != null) {
                            val target = File(staging, entry.name).canonicalFile
                            require(target.path.startsWith(staging.canonicalPath + File.separator)) {
                                "Unsafe archive path."
                            }
                            if (entry.isDirectory) {
                                target.mkdirs()
                            } else {
                                target.parentFile?.mkdirs()
                                FileOutputStream(target).use { output -> zip.copyTo(output) }
                            }
                            zip.closeEntry()
                            entry = zip.nextEntry
                        }
                    }
                }
            } else {
                val manifest = File(staging, "plugin.json")
                context.contentResolver.openInputStream(uri).use { input ->
                    requireNotNull(input) { "Unable to open the selected manifest." }
                    manifest.outputStream().use { output -> input.copyTo(output) }
                }
            }

            val manifestFile = staging.walkTopDown().firstOrNull { it.isFile && it.name == "plugin.json" }
                ?: error("plugin.json was not found.")
            val validation = PluginManifestValidator.validate(manifestFile.readText(StandardCharsets.UTF_8))
            require(validation.valid) { validation.error }

            val sourceRoot = manifestFile.parentFile ?: staging
            val targetRoot = File(pluginsRoot, validation.pluginId)
            targetRoot.deleteRecursively()
            sourceRoot.copyRecursively(targetRoot, overwrite = true)
            File(targetRoot, "plugin.json").writeText(validation.manifest.toString(2), StandardCharsets.UTF_8)
            DebugLogStore.append(context, "Imported plugin ${validation.pluginId}")

            return listPlugins().first { it.id == validation.pluginId }
        } finally {
            staging.deleteRecursively()
        }
    }

    private fun ensureBuiltIns() {
        writeBuiltIn(
            id = "volume-lock",
            name = "Volume Lock",
            description = "Keeps configured voice levels inside a safer target range.",
            settings = JSONArray()
                .put(JSONObject().put("key", "targetVolume").put("label", "Target volume").put("type", "range").put("value", 70).put("min", 0).put("max", 100).put("step", 1))
                .put(JSONObject().put("key", "autoNormalize").put("label", "Auto normalize").put("type", "toggle").put("value", true))
        )
        writeBuiltIn(
            id = "focus-mode",
            name = "Focus Mode",
            description = "Stores reduced-distraction preferences for Discord-related sessions.",
            settings = JSONArray()
                .put(JSONObject().put("key", "muteNotifications").put("label", "Mute notifications").put("type", "toggle").put("value", true))
                .put(JSONObject().put("key", "sessionLength").put("label", "Session length").put("type", "range").put("value", 45).put("min", 15).put("max", 240).put("step", 15))
        )
    }

    private fun writeBuiltIn(id: String, name: String, description: String, settings: JSONArray) {
        val directory = File(pluginsRoot, id)
        val manifestFile = File(directory, "plugin.json")
        if (manifestFile.isFile) return
        directory.mkdirs()
        val manifest = JSONObject()
            .put("id", id)
            .put("name", name)
            .put("version", "1.0.0")
            .put("description", description)
            .put("author", "YanagiKH")
            .put("category", "utility")
            .put("entry", "builtin")
            .put("permissions", JSONArray().put("ui-panel").put("settings-persistence"))
            .put("settings", settings)
            .put("hostKind", "panel")
            .put("language", "kotlin")
        manifestFile.writeText(manifest.toString(2), StandardCharsets.UTF_8)
    }

    private fun queryDisplayName(uri: Uri): String {
        context.contentResolver.query(uri, arrayOf(android.provider.OpenableColumns.DISPLAY_NAME), null, null, null)
            ?.use { cursor ->
                if (cursor.moveToFirst()) {
                    return cursor.getString(0) ?: "plugin.json"
                }
            }
        return uri.lastPathSegment ?: "plugin.json"
    }
}
