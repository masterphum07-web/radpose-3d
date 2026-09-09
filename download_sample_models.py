"""Download only explicitly approved local GLB assets.

This script intentionally ships with an empty manifest. Add a model only after
checking its anatomy, license, and source URL; never use a demo astronaut as a
clinical substitute. Run: python download_sample_models.py
"""
from pathlib import Path
from urllib.request import Request, urlopen

MODELS = {
    "human_skeleton.glb": {
        "url": "https://raw.githubusercontent.com/Nurkan1/Anatria-3D/main/public/anatomy/skeletal_male.glb",
        "license": "CC BY-SA 4.0 (Z-Anatomy / BodyParts3D)"
    },
    "skeletal_female.glb": {
        "url": "https://raw.githubusercontent.com/Nurkan1/Anatria-3D/main/public/anatomy/skeletal_female.glb",
        "license": "CC BY 4.0 (NIH Human Reference Atlas)"
    },
    "articular_joints.glb": {
        "url": "https://raw.githubusercontent.com/Nurkan1/Anatria-3D/main/public/anatomy/articular_male.glb",
        "license": "CC BY-SA 4.0 (Z-Anatomy / BodyParts3D)"
    }
}
OUT = Path("assets/models")

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    if not MODELS:
        print("No models configured. Add a verified anatomical GLB to MODELS first.")
        return
    for filename, meta in MODELS.items():
        if not meta.get("license"):
            raise ValueError(f"Missing license for {filename}")
        request = Request(meta["url"], headers={"User-Agent": "RadPose3D asset fetcher"})
        with urlopen(request, timeout=60) as response:
            data = response.read()
        if not data.startswith(b"glTF"):
            raise ValueError(f"{filename} is not a GLB file")
        (OUT / filename).write_bytes(data)
        print(f"Downloaded {filename} | {meta['license']}")

if __name__ == "__main__":
    main()
