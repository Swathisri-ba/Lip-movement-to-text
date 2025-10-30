
**Lip movement to text** converts silent lip movements from video into text.  
This repo contains the code and deployment configuration for the web app and stays synced with the project on v0.app for easy development and deployment.

## Features

- Capture or upload video of a speaker (no audio required).
- Detect and track mouth/lip movements frame-by-frame.
- Convert detected lip movements to text using the model and transcription pipeline.
- Web UI for live preview, transcripts, and export options.

## How it works

1. The front-end captures a video stream (or accepts an upload).
2. A lip / face landmark detector extracts mouth landmarks from each frame.
3. A trained lip-to-text model maps landmark sequences to textual output.
4. The transcription is displayed in the web UI and can be exported.

> Note: Model weights and training scripts are included (or linked) in this repo — see the `/models` and `/training` folders for details.

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/username/repository-name.git
   cd repository-name
