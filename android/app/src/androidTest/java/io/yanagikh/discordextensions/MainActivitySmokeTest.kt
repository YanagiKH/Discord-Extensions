package io.yanagikh.discordextensions

import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith

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
    fun usesExpectedApplicationPackage() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        assertEquals("io.yanagikh.discordextensions.debug", context.packageName)
    }
}
