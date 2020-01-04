# Local Files

1. **Does it work?**
1. **How do I use it?**
1. **My show isn't showing up / the episodes are numbered incorrectly.**

## Does it work?

Yuna only supports watching local files via **VLC**.

This is due to Electron (Chrome) that it runs on can't render a large portion of common video and audio encoding formats,
and the requirement to be able to read the status of the player to automatically update the list.

## How do I use it?

To watch local files make sure your local files folder settings is correctly configured.

![](https://i.imgur.com/5AfXNL1.png)

Then go to your Queue and click the `Select source...` dropdown.

![](https://i.imgur.com/cMU9414.png)

Then select it in the menu.

![](https://i.imgur.com/aNHxLqc.png)

## My show isn't showing up / the episodes are numbered incorrectly.

Most file names and structures provided by translators will work by default, but if it doesn't you might have to change it slightly.

Generally following these examples will work:

```
// Leading 0's are okay ("Episode 01", "Episode 1" both work).
// Generic metadata should be removed automatically by Yuna (e.g. "[BD 1080p]", "v2")
// Separators can be any of the following: . _ - space

// Examples:

[BASE FOLDER]/Sora Yori Mo Tooi Basho/Sora Yori Mo Tooi Basho - 01
[BASE FOLDER]/Sora Yori Mo Tooi Basho/Sora Yori Mo Tooi Basho_-_01_One Million Yen For Youth
[BASE FOLDER]/Sora Yori Mo Tooi Basho/Sora Yori Mo Tooi Basho E1
[BASE FOLDER]/Sora Yori Mo Tooi Basho/Sora.Yori.Mo.Tooi.Basho.Episode.01
[BASE FOLDER]/Sora Yori Mo Tooi Basho/Episode 1
[BASE FOLDER]/Sora Yori Mo Tooi Basho/E1

[BASE FOLDER]/A Certain Scientific Railgun/Season 1/Episode 1
[BASE FOLDER]/A Certain Scientific Railgun/S1/Episode 1
```
