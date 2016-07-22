# 0.4.2 (current)
Additions:
- Added ability to disable automatic update checks

Fixes:
- Fix watchlist not refreshing after updating it in proxtop
- Fixed parsing of profiles which have never been updated
- Fixed parsing of empty watchlists
- Fix logout not working how it's supposed to

# 0.4.1
Additions:
- Better caching for requests. Proxtop should be lot more responsive an generally has to load less
- Added button to create a new conversation for one or multiple people

Fixes:
- Fix parsing error since profile page updated
- Fixed a wrong translation
- Internal refactorings and dependency updates
- Minimal ui changes

# 0.4.0
Additions:
- Updated looks! Plus some general UI improvements
- Pass over raw video url to external applications
- Debian package
- Added option to clear chache
- Display and filter favorite conversations
- Added actions to conversations (Favorite, Block, Report)
- Display if conversation contains new messages
- Display category of news

Fixes:
- Redo tray icon handling
- Update to electron 1.2.0. Also updated other dependencies.
- Also use browser to detect if we're connected to the internet
- Continuously look for updates, not just at startup
- Fix progress being displayed incorrectly

# 0.3.1
Additions:
- Automatically save settings instead of manually having to click save.

Fixes:
- Fix display issue if avatar is too large in height.
- Fix too many tray icons on windows 7.
- Fix error when proxer displays to reload the site.
- Fix duplicate messages when opening a new conference.
- Internal updates.

# 0.3.0
Additions:
- Added own icon
- Improved messaging to be able to write, load previous messages and display participants
- Added notification for new, unread messages
- Added custom user-agent
- Save window size and location
- Added play/pause via space
- Open links in messages in system browser

Fixes:
- Fix inonsisten size of containers in watchlist
- Fix behavior on small screens for main page
- Fix default avatar in messages
- Fix watchlist notifications not showing on first login
- No longer check for updates if API limit is reached

# 0.2.1
Fixes:
- Error when trying to load while missing default settings.

# 0.2.0
Additions:
- Improved watching anime to be able to go to the next or previous episode
- Added buttons to add current or next episode to watchlist
- Added remove button to watchlist
- Added button to mark anime as finished on last episode, similar to the site
- Added ability to exit from fullscreen via escape key
- Added buttons to select stream if preferred one is not available
- Support more streams (Now also supports Streamcloud and YourUpload)
- Use loading icon throughout the app
- Display a dialog if a new version of the app is available

Fixes:
- Fix not displaying warning when saving password
- Fix not having a default preferred stream
- Fix video not using as much space as possible
- Fix avatar overflowing if image is too big
- Should be able to handle cloudflare DDoS protection
- Some UI fixes

# 0.1.1
- Initial release
- Features include
  - landing page with news
  - watchlist with notifications
  - viewing animes from the watchlist
  - viewing messages and conversations
