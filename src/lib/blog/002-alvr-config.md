---
title: Configuring ALVR
description: An in depth guide to configuring ALVR
pubDate: 2025-03-01
tags: [vr]
---

# Configuring ALVR

1. [Installation](#installation)
2. [Quick Settings](#quick-settings)
3. [Bitrate](#bitrate)
4. [Foveation](#foveation)
5. [Upscaling](#upscaling)
6. [Extras](#extras)
7. [Troubleshooting](#troubleshooting)

[ALVR](https://github.com/alvr-org/ALVR) is an application that streams PCVR from your PC to a compatible standalone headset.
It is similar to Virtual Desktop and Air Link. The common tradeoff of ALVR is its setup difficulty.
However, once properly configured, it is capable of delivering very high quality streaming for free.
It is also open source and available across many more platforms than VD or Link, including Linux as a host.

This guide requires ALVR 21.0.0 nightly from March 1st, 2025 or newer. This build includes upscaling and quick setting presets.
Older builds will work, but you will not be able to follow all instructions.

## Installation

ALVR **requires** a router _wired_ to your PC. The router **must** have 5ghz. Preferably, it should be in the same room as your headset.
Windows hotspot is... fine, if you have absolutely no other options. Use a tool like [HotspotKit](https://github.com/zeroxoneafour/HotspotKit) or
[these shell scripts](https://github.com/McAronDev/Windows-full-speed-HotSpot-for-VR) if you are using Windows hotspot.

ALVR also needs a PCVR compatible graphics card. Anything non-integrated from the last decade should work theoretically.
Do not try to run ALVR on your $200 laptop and complain about visual quality.

**If you are from the future after the release of ALVR 21.0.0, you can download the stable streamer from GitHub and client from the Meta store.**

To install the dev build of ALVR, head to [the nightly website](https://github.com/alvr-org/ALVR-nightly/releases) and download ALVR **launcher**
for whatever platform you are using to host. Extract it, add it to the path or create a shortcut, and run the executable.
Wait for it to load, then select "Add version". Set the channel to "Nightly" and install the latest build.

To install the ALVR client, connect your headset to your PC and select "Install APK" in the launcher. It should install it automatically.
You can also download the APK from [here](https://github.com/alvr-org/ALVR-nightly/releases) and install it yourself. Make sure the streamer
and client versions match.

Once everything is installed, launch the streamer and go through setup. If you continue to follow this guide, you should be able to just use
default settings from setup.

If you are having any issues, see [the official installation guide](https://github.com/alvr-org/ALVR/wiki/Installation-guide/).

## Quick Settings

Go to the settings page on the left toolbar. There should be six tabs - Presets, Video, Audio, Headset, Connection, and Extra.
This section of the guide only concerns Presets, however it is recommended that you configure [bitrate](#bitrate) and [upscaling](#upscaling) in Video as well.
As of March 1st, ALVR has foveation presets. If you are using an older version, there is also a [foveation guide](#foveation) provided.

### Preferred framerate

This is the first thing you must choose. It determines all of your other settings. The default of 72hz is low in my opinion. I personally recommend 90hz.
If you are playing latency-dependent games or are very sensitive to delay (and you're using a wireless streamer for some reason), use 120hz.

### Resolution

After the introduction of upscaling, this setting isn't as important as it has been in the past. Pick a resolution that makes sense for your GPU.
Personally, I have a laptop 3070, which runs 90hz comfortably at the low resolution preset. This preset is still almost 4k monitor resolution.

Rules of thumb at 90hz -

- Very low - 1060-1070 and 2060, or whatever the AMD equivalent is, lower end Arc
- Low - 3060, 2070, 1080, AMD equivalent, higher end Arc
- Medium - 3070, 2080, 1080 ti, AMD equivalent
- High - 4070, 3080, 7900xtx

Anything above high needs a _very_ fast GPU. Remember that it is preferred to have a bit of GPU headroom for encoding and making sure there are no stutters.

### Encoder and Codec

You want to keep encoder set to speed for most applications. H264 uses more bitrate but takes a shorter time to encode
at the same visual quality on older hardware. H265 and AV1 use less bitrate. Encode and decode are less noticable on newer GPUs and headsets.
H265 and AV1 also support 10 bit encoding, which significantly decreases color banding at lower bitrates. Note that 10 bit encoding is not supported
when using Linux with Nvidia. This particular setup not supporting things is a pretty common trend.

### Headset speaker and microphone

Pretty simple, enable or disable if you want audio. Remember that VB-Audio Cable must be properly setup on Windows to use the mic.

### Biotracking

If you don't want hand tracking, you can disable it. Disable eye and face tracking if your headset doesn't support it. In my experience, SteamVR Input 2.0
hand tracking lacks default bindings so you need to do a bit more setup with it if you want to use it. ALVR bindings make your hand a controller.
See [the bindings here](https://github.com/alvr-org/ALVR/wiki/Hand-tracking-controller-bindings). Eye tracked foveated rendering isn't supported with
ALVR or SteamVR, and ALVR does not yet support eye tracked foveated encoding to my knowledge.

### Foveation preset

This depends on the quality of your headset lenses and your tendency to look around in VR. Looking at the edges will look much worse on high than
it will on light. I recommend Medium for fresnel lenses, Light for pancake lenses, and High only if the image quality in the center is severely degraded.
Disabling this setting completely will have very negative consequences for your stream quality.

If you don't see this setting, check out [the foveation guide](#foveation) to set it up.

## Bitrate

This is the setting that makes or breaks ALVR. The default is an abysmal constant 30 Mbps, which I would consider unusable.

Scaling up bitrate also increases encoding and decoding latency. Remember H265 and AV1 take longer to transcode than H264.

If you have a strong network setup and recent hardware, a good baseline is constant H264 200 Mbps. If you experience any issues with adaptive bitrate,
revert back to constant bitrate at a stable Mbps. I recommend using H265/AV1 150 Mbps if you have 10 bit encoding support.

To turn on 10 bit encoding, head to the Encoder config dropdown and enable 10 bit encoding. You can also enable HDR and some other visual enhancements here.

### Adaptive bitrate

Adaptive bitrate is a beast to configure. I recommend all default settings except for the following.

- Maximum bitrate - Set to whatever constant bitrate you think your network and hardware can handle. Anything over 500 Mbps is going to cause some issues.
- Encoder/decoder latency limiter - Make sure encoder and decoder latency doesn't get too high. I recommend setting max decoder latency to 12-15ms.
- Maximum network latency - This really shouldn't get too high if your network is good. Just enabling it and keeping the default 12ms should be fine.

Fine tune these settings if you want to. I've never really had an experience with adaptive bitrate that wasn't just better with a well-picked constant bitrate.
However, ALVR's adaptive bitrate settings are very helpful if you can tame them.

## Foveation

You want to keep this on. Never, ever, _ever_ turn foveated encoding off. That being said, the default settings are a bit strong in my opinion.

If you have foveation preset support, follow [the guide above](#foveation-preset) to configure foveation as it is much simpler.

You want to maximize center size and edge resolution with foveated encoding without overloading your bitrate. At a bitrate of 200 Mbps,
I use the default Light settings on my Quest 3 (pancake lenses) - 0.8 center width and height and 8.00 horizontal and vertical edge ratio.
With upscaling these settings are fine at my bitrate. Fresnel lenses and lower bitrates should tune these down - Fresnel lenses because you won't notice
lower quality on the edges, and lower bitrates because you will notice lower quality in the center with less foveation.

Center shift Y is 0.10 by default. This helps you see things below you better by making them higher quality. It is more distracting to me personally
to see low quality above me though, so I keep this at 0.0. Center shift X should stay at 0.40. For whatever reason, if it is at 0, the foveated rendering
overlaps with the sweet spots on the Quest 3 and you get binocular vision.

## Upscaling

If using upscaling, I recommend turning Sharpening to 0.00 in Color correction. You will need a fairly strong headset to run upscaling.
The Quest 3 can comfortably run upscaling at Low resolution preset with a 1.5x upscale modifier. Resolutions above Medium will not see much benefit.

Note that upscaling causes slight shimmering, but produces a sharper image. If you are sensitive to shimmering more than you are to low resolution,
do not enable upscaling. If you've used flat game upscaling, it has many of the same advantages and disadvantages, except much more noticable.

Once you've enabled upscaling, there are a few simple settings plus upscale factor.

- Edge direction - Keep enabled for most purposes. Especially in VR, where sharpening must occur in several orientations.
- Edge threshold - 4.0 is the recommended default according to the [documentation](https://github.com/SnapdragonStudios/snapdragon-gsr/tree/main/sgsr/v1).
- Edge sharpness - Same as edge threshold, you can probably turn down if there's too much sharpening.

Upscale factor is the big setting, and setting this too high will kill your headset. This is a dimensional multiplier, so running Low resolution
(1856x1856 pixels per eye) times a 1.5x modifier will result in a 2784x2784 rendered square. This is higher than the Quest 3's panel resolution.
This has benefits, however, upscaling too high will cause performance loss on the client. Keep the transcoding view resolution and your headset's
panel resolution in mind while choosing a factor. Also keep in mind the default FSR settings for upscaling -

- 1.3x - FSR Ultra Quality
- 1.5x - FSR Quality
- 1.7x - FSR Balanced
- 2.0x - FSR Performance
- 3.0x - FSR Ultra Performance

Also note that this setting is intended to take load off of the computer. If you set the upscaler to 3.0x, it is also recommended you tune down your
resolution to Very Low or even lower.

## Extras

ALVR also supports wired connection, much like Link. You can use whatever bitrate your cable and ports support.

Wireless streaming can use UDP or TCP. UDP is recommended if you have a strong network.

You can also change your controller type in Headset/Controllers to whatever controllers you are using.

I use almost all default settings in Headset, Connection, and Extra. Most of the helpful settings have tooltips for you to use for fine tuning.

## Troubleshooting

### Extreme jittering in SteamVR

Open `steamvr.vrsettings` in the `config` folder wherever Steam is installed. Locate the `steamvr` section and make the top look something like this -

```
    "steamvr" : {
        "motionSmoothing" : false,
        <rest of settings for steamvr>
```

This will disable motion smoothing, which counterintuitively can smooth out motion in SteamVR.

### Random lag spikes

Make sure you have a properly set up router wired directly into your PC and close to your headset. You may need to lower the bitrate, resolution, or
upscaling depending on if you have transcode, render, or client latency. See the Statistics page on the left sidebar for info about your stream.

### Cannot connect

Make sure your headset and PC are on the same network. If you have two routers (one for PCVR and one for internet), the headset must be connected to the
PCVR one. You can add a device manually to connect it by IP, but going through two routers will cause more network latency.
