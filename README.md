# Proxtop - A proxer.me desktop client
Proxtop is an experimental attempt to create a desktop client for the popular german anime site [proxer.me](https://proxer.me).

This is considered experimental because there's no official API in place so this app parses the site itself to provide the content. Thus, the application might be less responsive as expected or even unusable. Another problem with this route is that UI changes _may_ break this application entirely.

Please note that currently user data is stored on disk in plain text, use at own risk.

## Goals

These goals are features/use cases that I want this app to provide to the user. All of them should be implemented until I consider this experiment 'done'.

- [X] Use your existing proxer.me account
- [X] View watchlist
- [X] Watch proxer HD streams
- [ ] Update watchlist
- [ ] Watch streams with favorite video player (prefered: MPV)
- [X] Get notifications on new watchlist releases

## Optional Goals

Goals that I would like to implement afterwards, if I have interest in continuing. These might never be included.

- Browse animes and search
- Add same functionalities for mangas
- Messaging
- Forum notifications

## Technologies

- Electron
- Angularjs

## What this application is and is not
- It is _not_ a complete frontend/replacement for proxer.me, it is just an alternative frontend for doing the most common tasks on the site, such as watching anime.
- It is so far _not_ officially supported and thus just a community/personal effort.

## FAQ

> This seems like a hard and terrible way to do it!

You might say that and you wouldn't be wrong. However, until the API is out, which might take forever, I still want something like this app to exist and that I can use. Even if it will end up in a state where only myself could use it, as long as it is there. Also, I've done some small parts this way in the past and those still work, so I don't really have a problem doing it this way.

> Why do you need an app on desktop if you have the browser?

This is a reasonable question, so let me tell you this:

1. In the browser the page is fixed, meaning the layout, menu and style are not really modifyable by me. If I don't like the style or if I want to make certain workflows faster, how would I do that? I don't want to end up with millions of lines of injected js code to change the site and get totally thrown off once the design changes. I'll probably end up with the same thing here, but in a separate app it's far easier to manage than a hacky script that ends up getting injected.
2. I cannot easily embed the content of the web page into other things, like a video player. There's no nice way for example to open the video in my local media player. Why would I want this? Better video controls, less memory footprint (some of the player are just ... ugh, shitty. Do you remember flash?) and brings more flexibility.
3. I can easily add new functionality without, again, fiddling with content scripts or maybe even doing things totally different.

TL;DR: Convenience, because I like to do things differently.

> Doesn't this hurt the page creators?!

Page load: Page load is a concern, as this is a hobby website and thus only limited resources are available. However, this is not really a concern as this app does similar/identical requests to the page as if a user would do the same steps. However, with convenience features like watchlist notification, this might be less true, as it has to check in the background if new ones are available which would cause more page loads to happen. I do believe however this is no big concern as by default these requests do not happen often.

Advertisments: There are three cases
1. You donate to the creators already, which results in no ads on the site, thus no difference.
2. You have an adblocker installed so you there's no difference either.
3. You have no adblocker installed and would normally see ads. This is the only case ad revenue would be missed.

I hate ads myself, so I don't see this app getting ads to increase revenue for the creators being a thing. Just donate; makes everyone happier.
