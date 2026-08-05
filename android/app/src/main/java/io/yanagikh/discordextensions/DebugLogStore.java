package io.yanagikh.discordextensions;

import android.content.Context;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
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
        try (FileInputStream input = new FileInputStream(logFile);
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[4096];
            int read;
            while ((read = input.read(buffer)) >= 0) {
                output.write(buffer, 0, read);
            }
            return output.toString(StandardCharsets.UTF_8.name());
        } catch (IOException exception) {
            return exception.getMessage() == null ? "Unable to read debug log." : exception.getMessage();
        }
    }
}
