#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static double clamp(double value, double min_value, double max_value) {
    if (value < min_value) return min_value;
    if (value > max_value) return max_value;
    return value;
}

int main(void) {
    char buffer[2048];
    size_t length = fread(buffer, 1, sizeof(buffer) - 1, stdin);
    buffer[length] = '\0';

    double limit = 68.0;
    if (strstr(buffer, "\"limit\":") != NULL) {
        const char *cursor = strstr(buffer, "\"limit\":") + 8;
        limit = strtod(cursor, NULL);
    }

    double measured = limit;
    if (strstr(buffer, "\"measuredVolume\":") != NULL) {
        const char *cursor = strstr(buffer, "\"measuredVolume\":") + 18;
        measured = strtod(cursor, NULL);
    }

    int hard_clamp = strstr(buffer, "\"hardClamp\":true") != NULL;
    double normalized = hard_clamp ? clamp(limit, 0.0, 100.0) : clamp((limit + measured) / 2.0, 0.0, 100.0);

    printf("{\"plugin\":\"c-voice-guard\",\"status\":\"ok\",\"normalizedVolume\":%.0f,\"message\":\"C plugin processed the sample.\"}\n", normalized);
    return 0;
}
