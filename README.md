# RadPose 3D

Interactive client-side radiographic positioning pocket guide for GitHub Pages.

## Sources and licensing

- Viewer: [`google/model-viewer`](https://github.com/google/model-viewer), Apache-2.0.
- Anatomy reference/asset pipeline: [`paulvanmetre/anatomy-viewer`](https://github.com/paulvanmetre/anatomy-viewer), using BodyParts3D under CC BY-SA 2.1 Japan.
- Alternative atlas: [Z-Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy), CC BY-SA 4.0.
- Technique values are educational examples. Verify against local protocol and qualified clinical guidance.

## Add a model

Put a licensed `.glb` file in `assets/models/`, then set its relative path in `data/positions.json` under `model_url`.

## Deploy

Push to GitHub and enable Pages from `main` and `/ (root)`. No build step is required.
