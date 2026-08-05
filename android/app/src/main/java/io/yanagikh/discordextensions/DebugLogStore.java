package io.yanagikh.discordextensions;

import android.content.Context;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.Instant;

public final class DebugLogStore {
    private static final String FILE_NAME = "debug.log";

    private DebugLogStore() {}

    public static synchronized void append(Context context, String message) {
        File logFile = new File(context.getFilesDir(), FILE_NAME);
        try (FileWriter writer = new FileWriter(logFile, true)) {
            writer.write(Instant.now() + " " + message + System.lineSeparator());
        } catch (IOException ignored) {
            // Logging must never crash the host.
        }
    }

    public static synchronized String read(Context context) {
        File logFile = new File(context.getFilesDir(), FILE_NAME);
        if (!logFile.isFile()) {
            return "";
        }
        try {
            return Files.readString(logFile.toPath(), StandardCharsets.UTF_8);
        } catch (IOException exception) {
            return exception.getMessage() == null ? "Unable to read debug log." : exception.getMessage();
        }
    }
}
