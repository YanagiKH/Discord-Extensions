#include <algorithm>
#include <iostream>
#include <string>

static double clamp(double value, double min_value, double max_value) {
    return std::max(min_value, std::min(max_value, value));
}

int main() {
    std::string input((std::istreambuf_iterator<char>(std::cin)), std::istreambuf_iterator<char>());

    double density_score = 0.5;
    if (input.find("\"density\":\"compact\"") != std::string::npos) {
        density_score = 0.9;
    } else if (input.find("\"density\":\"comfortable\"") != std::string::npos) {
        density_score = 0.25;
    }

    const bool show_badges = input.find("\"showChannelBadges\":true") != std::string::npos;
    const double spacing = clamp(12.0 + (density_score * 8.0), 8.0, 24.0);

    std::cout << "{\"plugin\":\"cpp-compact-sidebar\",\"status\":\"ok\",\"spacing\":" << spacing
              << ",\"showBadges\":" << (show_badges ? "true" : "false")
              << ",\"message\":\"C++ plugin generated compact layout guidance.\"}" << std::endl;
    return 0;
}
