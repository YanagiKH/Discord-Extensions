package io.yanagikh.discordextensions

import android.content.Context
import android.net.Uri
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.nio.charset.StandardCharsets
import java.nio.file.Files
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
            Files.writeString(File(targetRoot, "plugin.json").toPath(), validation.manifest.toString(2), StandardCharsets.UTF_8)
            DebugLogStore.append(context, "Imported plugin ${validation.pluginId}")

            return listPlugins().first { it.id == validation.pluginId }
        } finally {
            staging.deleteRecursively()
        }
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
