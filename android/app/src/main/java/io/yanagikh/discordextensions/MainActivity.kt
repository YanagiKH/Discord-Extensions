package io.yanagikh.discordextensions

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import io.yanagikh.discordextensions.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var repository: PluginRepository

    private val importLauncher = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri == null) return@registerForActivityResult
        runCatching {
            contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        runCatching { repository.importFromUri(uri) }
            .onSuccess {
                Toast.makeText(this, R.string.import_complete, Toast.LENGTH_SHORT).show()
                renderPlugins()
            }
            .onFailure { error ->
                DebugLogStore.append(this, "Import failed: ${error.message}")
                Toast.makeText(this, getString(R.string.import_failed, error.message), Toast.LENGTH_LONG).show()
                renderDebugLog()
            }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        repository = PluginRepository(this)

        binding.importButton.setOnClickListener {
            importLauncher.launch(arrayOf("application/json", "application/zip", "application/octet-stream"))
        }
        binding.workbenchButton.setOnClickListener {
            startActivity(Intent(this, WorkbenchActivity::class.java))
        }
        binding.discordWebButton.setOnClickListener {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://discord.com/app")))
        }
        binding.refreshButton.setOnClickListener {
            renderPlugins()
            renderDebugLog()
        }

        DebugLogStore.append(this, "Android host started")
        renderPlugins()
        renderDebugLog()
    }

    override fun onResume() {
        super.onResume()
        if (::repository.isInitialized) {
            renderPlugins()
            renderDebugLog()
        }
    }

    private fun renderPlugins() {
        binding.pluginContainer.removeAllViews()
        val plugins = repository.listPlugins()
        if (plugins.isEmpty()) {
            binding.pluginContainer.addView(TextView(this).apply { setText(R.string.no_plugins) })
            return
        }

        plugins.forEach { plugin ->
            binding.pluginContainer.addView(Switch(this).apply {
                text = "${plugin.name} v${plugin.version}\n${plugin.description}"
                isChecked = plugin.enabled
                setPadding(8, 12, 8, 12)
                setOnCheckedChangeListener { _, enabled ->
                    repository.setEnabled(plugin.id, enabled)
                    renderDebugLog()
                }
            })
        }
    }

    private fun renderDebugLog() {
        binding.debugLogText.text = DebugLogStore.read(this).takeLast(12_000)
    }
}
