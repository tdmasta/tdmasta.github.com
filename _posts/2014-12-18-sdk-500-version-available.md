---
layout: post
title: "SDK 5.0.0 version available"
tagline: "For developpers"
description: "A new SDK version made available to you developers"
category: releases
tags:
---
{% include JB/setup %}

![We are pleased to announce today the release of our new TD RF Module SDK v5.0.0.0!](/images/new_sdk_available_5.0.0.png)

What's new ?
---

<br/>
This major version introduces two major new features:

* bidirectional SIGFOX transmission (aka "downlink" mode), that enables a device to receive data from the SIGFOX network
* SIGFOX proxy capability, both in transparent (i.e. using the device's own ID) or non-transparent (using the proxy's ID)

As usual, this version also provides numerous improvements to the existing API for the TD1204/TD1208 RF modules, while still maintaining backwards compatibility with the existing code. Additions, changes and bug fixes are covered in the detailed release note.

However, compatibility with the lowest end TD1202 RF modules has been frozen to SDK 4.1.0, as it is no longer possible to fit all the newest capabilities into the limited TD1202 Flash and RAM memory capacities. You can find the latest SDK 4.1.0 for the TD1202 [here](https://github.com/Telecom-Design/TD_RF_Module_SDK/tree/v4.1.0).

More examples were added to the previously existing ones, including some examples making use of the new bidirectional capabilities and high-level API for managing buttons with variable press durations and blinking LEDs.

As developers ourselves, except where restricted by patents or non-disclosure agreements, we decided to provide most of the delivered code as source code, allowing developers to understand what is under the hood, modify it, expand it, or simply use it as is with an increased confidence.

We also opted to only use free-of-charge software building tools, and as much as possible FOSS (Free Open-Source Software) tools, as well as a cheap Starter Kit from Silicon Labs/Energy Micro for the hardware program/debug probe, in order to lower the front costs for developments down to the bare minimum.

How to get it ?
---

<br/>
1. Download the SDK (about 500 Megs) and <strong> unzip it in C:\ </strong> (that's mandatory) <a href="http://sdktools.s3.amazonaws.com/TD_RF_Module_SDK_Tools-v4.0.0.zip" class="btn btn-info" target="_blank"> <i class="icon-download"> </i> HERE </a>
2. Get the samples code and the library on our github repo (registered used access) <a href="https://github.com/Telecom-Design/" class="btn btn-warning"> <i class="icon-lock"> </i> HERE </a>
3. Get the complete documentations and support are available publicly <a href="https://github.com/Telecom-Design/Documentation_TD_RF_Module" target="_blank" class="btn btn-success"> <i class="icon-github"> </i> HERE </a> 

Please take a look at this new TD RF Module SDK, and we hope you will enjoy for developing the next-generation IoT devices based on the SIGFOX technology!

–-The Telecom Design R&D team
