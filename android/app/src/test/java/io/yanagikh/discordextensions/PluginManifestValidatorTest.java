package io.yanagikh.discordextensions;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class PluginManifestValidatorTest {
    @Test
    public void acceptsValidManifest() {
        String manifest = "{\"id\":\"sample-tool\",\"name\":\"Sample\",\"version\":\"1.0.0\",\"description\":\"Test\",\"author\":\"Tester\",\"entry\":\"index.js\",\"permissions\":[],\"settings\":[]}";
        assertTrue(PluginManifestValidator.validate(manifest).valid);
    }

    @Test
    public void rejectsUnsafeId() {
        String manifest = "{\"id\":\"../unsafe\",\"name\":\"Sample\",\"version\":\"1.0.0\",\"description\":\"Test\",\"author\":\"Tester\",\"entry\":\"index.js\",\"permissions\":[],\"settings\":[]}";
        assertFalse(PluginManifestValidator.validate(manifest).valid);
    }
}
