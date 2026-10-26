# Free Video AI for NovaReel (Windows)

Selected official open-source GitHub project: https://github.com/Comfy-Org/ComfyUI
Recommended model: Wan2.2 TI2V 5B — text-to-video and image-to-video.
Official tutorial: https://docs.comfy.org/tutorials/video/wan/wan2_2

ComfyUI core is GPL-3.0; Wan2.2 is Apache-2.0. Free local inference does not need paid API credits, but you need a compatible NVIDIA GPU, disk, downloads, and electricity. Hosting your NovaReel web app on Render static does not provide GPU inference.

## Step 1 — Download and check hardware

Save [INSTALL_WINDOWS.ps1](./INSTALL_WINDOWS.ps1) from this folder to your Windows laptop.
Open PowerShell in the folder and run:

    powershell -NoProfile -ExecutionPolicy Bypass -File .\INSTALL_WINDOWS.ps1 -CheckOnly

It will display GPU/VRAM, Git, Python, free disk. This step changes nothing. ComfyUI's official 5B guide says about 8GB VRAM with native model offloading; compatibility and speed vary.

## Step 2 — Install ComfyUI on YOUR laptop

    powershell -NoProfile -ExecutionPolicy Bypass -File .\INSTALL_WINDOWS.ps1

Read the prompt; type INSTALL to authorize the downloads. It clones the official GitHub project into a separate folder, creates an isolated virtual Python environment, and installs CUDA PyTorch and the free application packages. It won't overwrite your old apps or automatically purchase credits. The video model itself is **not** downloaded at this step.

## Step 3 — Launch and add Wan2.2

    powershell -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\Projects\NovaReel-Free-Video\START_COMFYUI.ps1"

Open http://127.0.0.1:8188 in the Windows browser. In ComfyUI: Workflow → Browse Templates → Video → Wan2.2 5B video generation.

Following the official guide, separately download the model weights from https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged:
- wan2.2_ti2v_5B_fp16.safetensors into ComfyUI/models/diffusion_models
- umt5_xxl_fp8_e4m3fn_scaled.safetensors into ComfyUI/models/text_encoders
- wan2.2_vae.safetensors into ComfyUI/models/vae

These files are **large**. Only download them if you have enough disk and suitable hardware. Use a short low-resolution sample first. This is true generated AI footage, unlike NovaReel's animated storyboard export.

For 9:16 HappyNova Kids video, create 3 short shots: suspense hook, adventure story, and clear happy payoff. Reuse the same original character image in image-to-video mode to improve consistency.

## Alternative: FramePack (6GB RTX 30XX/40XX/50XX)

https://github.com/lllyasviel/FramePack

Official Apache-2.0 project. Good for starting from an original character image. Creator says >=6GB GPU VRAM on NVIDIA RTX 30/40/50 and requires **more than 30GB model download**. Its official Windows one-click release is linked in the GitHub README; extract, run update.bat, then run.bat. No paid API needed. The README warns against other sites impersonating FramePack.

## Important limitation

A GitHub commit cannot directly install programs on your Windows PC. The bundled PowerShell script is install-ready and checks your GPU; you must explicitly run it locally and approve downloads. No native Windows installation or GPU render has been performed by ChatGPT.
