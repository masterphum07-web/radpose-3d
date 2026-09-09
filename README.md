# RadPose 3D

## Clinical reference policy

Clinical positioning content and technique ranges are cross-checked against exactly three reference groups:

1. The user-supplied course-pack PDFs (Positioning and Basic Radiographic Anatomy).
2. NCBI Bookshelf, *X-ray Radiographic Patient Positioning*: https://www.ncbi.nlm.nih.gov/books/NBK565865/
3. American College of Radiology, Practice Parameters and Technical Standards: https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Practice-Parameters-and-Technical-Standards

Technique values are reference ranges for adult general radiography, not universal exposure prescriptions. Verify the local protocol, detector, patient habitus, equipment, and responsible radiographer/physicist before clinical use.

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
