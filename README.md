# Destiny 2 LFG Bot

## Commands

### Configuration Commands

* `/bot-admin`: Command for Configuration Bot
* `/server-admin`: Command for Configuration Server

### LFG Commands

* `/lfg create`: Create Normal LFG
* `/lfg edit`: Edit Normal LFG
* `/lfg delete`: Delete Normal LFG
* `/lfg get-info`: Print Normal LFG Information Message
* `/long-term-lfg create`: Create Long-Term LFG
* `/long-term-lfg edit`: Edit Long-Term LFG
* `/long-term-lfg delete`: Delete Long-Term LFG
* `/long-term-lfg get-info`: Print Long-Term LFG Information Message
* `/regular-lfg create`: Create Regular LFG
* `/regular-lfg edit`: Edit Regular LFG
* `/regular-lfg delete`: Delete Regular LFG
* `/regular-lfg get-info`: Print Regular LFG Information Message

## How to Start Regular LFG

1. Right Click Regular LFG Information Message
2. Click Application -> regular-lfg-start
3. If You Have Permission, Regular LFG will be Started

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

> Caution: Maximum Activity Number is 25
