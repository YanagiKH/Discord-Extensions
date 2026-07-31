use std::io::{self, Read};

fn clamp(value: f64, min: f64, max: f64) -> f64 {
    value.max(min).min(max)
}

fn main() {
    let mut input = String::new();
    let _ = io::stdin().read_to_string(&mut input);

    let ceiling = input
        .split("\"ceiling\":")
        .nth(1)
        .and_then(|chunk| chunk.chars().take_while(|c| c.is_ascii_digit()).collect::<String>().parse::<f64>().ok())
        .unwrap_or(72.0);
    let protect_peaks = input.contains("\"protectSharpPeaks\":true");
    let measured = input
        .split("\"measuredVolume\":")
        .nth(1)
        .and_then(|chunk| chunk.chars().take_while(|c| c.is_ascii_digit() || *c == '.').collect::<String>().parse::<f64>().ok())
        .unwrap_or(ceiling);

    let normalized = if protect_peaks {
        clamp((measured * 0.35) + (ceiling * 0.65), 0.0, 100.0)
    } else {
        clamp(ceiling, 0.0, 100.0)
    };

    println!(
        "{{\"plugin\":\"rust-safe-speaker\",\"status\":\"ok\",\"normalizedVolume\":{},\"message\":\"Rust plugin adjusted speaker volume.\"}}",
        normalized.round()
    );
}
