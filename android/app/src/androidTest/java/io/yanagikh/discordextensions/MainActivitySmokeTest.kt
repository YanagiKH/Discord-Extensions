package io.yanagikh.discordextensions

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.action.ViewActions.closeSoftKeyboard
import androidx.test.espresso.action.ViewActions.replaceText
import androidx.test.espresso.matcher.ViewMatchers.withId
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File

@RunWith(AndroidJUnit4::class)
class MainActivitySmokeTest {
    @Test
    fun launchesMainActivity() {
        ActivityScenario.launch(MainActivity::class.java).use { scenario ->
            scenario.onActivity { activity ->
                assertEquals("Discord Extensions", activity.getString(R.string.app_name))
            }
        }
    }

    @Test
    fun createsModuleFromWorkbench() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val moduleRoot = File(context.filesDir, "mods/smoke-module")
        moduleRoot.deleteRecursively()

        ActivityScenario.launch(WorkbenchActivity::class.java).use {
            onView(withId(R.id.moduleIdInput)).perform(replaceText("smoke-module"), closeSoftKeyboard())
            onView(withId(R.id.moduleNameInput)).perform(replaceText("Smoke Module"), closeSoftKeyboard())
            onView(withId(R.id.createModuleButton)).perform(click())
            assertTrue(File(moduleRoot, "plugin.json").isFile)
            assertTrue(File(moduleRoot, "src/index.js").isFile)
        }
    }

    @Test
    fun usesExpectedApplicationPackage() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        assertEquals("io.yanagikh.discordextensions.debug", context.packageName)
    }
}
