from __future__ import annotations

import json
import sys
from typing import Any


def clamp(value: float, minimum: float = 0.0, maximum: float = 100.0) -> float:
    return max(minimum, min(maximum, value))


def normalize_volume(payload: dict[str, Any]) -> dict[str, Any]:
    target_volume = float(payload.get('targetVolume', 70))
    smoothing = float(payload.get('smoothing', 0.35))
    measured = float(payload.get('measuredVolume', target_volume))
    normalized = measured * smoothing + target_volume * (1.0 - smoothing)

    return {
        'plugin': 'python-voice-guard',
        'status': 'ok',
        'targetVolume': clamp(target_volume),
        'normalizedVolume': round(clamp(normalized), 2),
        'message': 'Python plugin processed the incoming volume sample.'
    }


def main() -> int:
    try:
        raw = sys.stdin.read().strip()
        payload = json.loads(raw) if raw else {}
        result = normalize_volume(payload)
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({'plugin': 'python-voice-guard', 'status': 'error', 'message': str(exc)}))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
