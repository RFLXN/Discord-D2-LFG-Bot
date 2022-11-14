# Destiny 2 LFG Bot

## Activity Map JSON Format

Check Schema in `/resource/lfg-activity-map-schema.json`

```json
// Root Node Start With Array
[
  // Activity Object Here
  {
    "name": "ACTIVITY_NAME",
    "localizationName": {
      "ko": "KOREAN_ACTIVITY_NAME",
      "ja": "JAPANESE_ACTIVITY_NAME"
    }
  },
  ...
  // Repeat Activity Object
]
```

> Careful: Maximum Activity Number is 25
