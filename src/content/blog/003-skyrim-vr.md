---
title: Skyrim VR on Linux
pubDate: 2025-03-23
tags: [vr]
---

Skyrim SE is a bad setup process, Skyrim VR is several times worse, and Skyrim
VR on Linux with ALVR is ungodly. It took me a few hours, but here's a guide
(mostly for my own future reference) on how to get it working.

## Downloads

Start by downloading the files at [this mega link](https://mega.nz/file/sKxhEQgQ#cUiV66QV5hD8zxeTIk2Y0OlV3XMffKfI8RmQR2S-1f4).
In here is a pretty basic essential mod list consisting of -
* [Patched SKSEVR](https://github.com/ValveSoftware/Proton/issues/170#issuecomment-799702546)
* A 3D sound patch
* Engine Fixes
* SkyUI
* VRIK and a neardistance patch for it
* SkyrimVRTools
* HIGGS
* No Stagger Mod

Just download the zip, extract it somewhere accessible, and get ready to do some
dirty work.

You will also need SteamTinkerLaunch. I've found that its Vortex installer is
the only one that works on Linux. You don't need to install it as a Steam tool.

## Root

Launch the game unmodded once so all proper files and directories are created.
Binaural Audio, Engine Fixes 2, and all the exes and dlls in the base (non-data)
folder of SKSEVR needs to be extracted and force copied to the root folder of
your SkyrimVR installation.

After you do that, some special setup needs to be done so the game runs nicely
with Proton without using SteamTinkerLaunch. You can do this by going to the
root folder and renaming `SkyrimVR.exe` to `SkyrimVRGame.exe`. Next, create
`Data/skse/` if it's not already there and add a file `skse.ini` to it. Edit
the file so it contains -
```
[Loader]
RuntimeName=SkyrimVRGame.exe
```
Finally, copy `sksevr_loader.exe` to a new file `SkyrimVR.exe`. Steam will now
launch SKSEVR's loader, which will hook onto the actual game `SkyrimVRGame.exe`.

## Vortex

Next, use SteamTinkerLaunch to open Vortex. Add Skyrim VR as a game. Make sure
to use a config directory on the same drive as the game folder so hardlinks can
be made.

Zip up the Data directory in the extracted SKSE folder into a zip called
SKSE_Data.zip. This is the first mod you need to install.

After installing SKSE_Data, add all of the archives as mods except for SKSE, Binaural Audio, and Engine Fixes 2. Apply these mods in Vortex and make sure all the hardlinks are properly written.

## plugins.txt

This part genuinely almost killed me. You need to go to `~/.local/share/Steam/steamapps/compatdata/611670/pfx/drive_c/users/steamuser/AppData/Local/Skyrim\ VR/`
or wherever your Skyrim AppDataLocal folder is and put this in `plugins.txt` -
```
*SkyUI_SE.esp
*higgs_vr.esp
*NoStagger.esp
*vrik.esp
```
Without this you will get very confusing (at least for first-time modders)
crashes. After this step, you should be able to enjoy your Skyrim VR!
