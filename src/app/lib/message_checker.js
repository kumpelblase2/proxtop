const settings = require('../settings');
const { MessageReadCache } = require('../storage');
const windowManager = require('../ui/window_manager');
const Notification = require('../notification');
const translate = require('../translation');

const CHECK_DELAY = 5000;

class MessageChecker {
    constructor(messageHandler, messageService) {
        this.messages = messageHandler;
        this.messageService = messageService;
        this.running = false;
        this.lastCheck = 0;
        this.lastTimer = null;
        this.translation = translate();
    }

    start() {
        this.running = true;
        this._loop();
    }

    stop() {
        if(this.lastTimer) {
            clearTimeout(this.lastTimer);
            this.lastTimer = null;
        }
        this.running = false;
    }

    _loop() {
        if(!this.running) {
            return;
        }

        if(this._passedInterval() && MessageChecker._isEnabled()) {
            this._check();
        }

        this.lastTimer = setTimeout(() => {
            this._loop();
        }, CHECK_DELAY);
    }

    _check() {
        this.lastCheck = new Date().getTime();
        LOG.info("Check if new messages have arrived...");
        this.messageService.loadLatestMessages().then((update) => {
            const { hasMore, messages: notifications } = update;
            notifications.forEach((notification) => {
                if(!MessageReadCache.hasReceived(notification.username)) {
                    LOG.verbose('Got new message from ' + notification.username);
                    Notification.displayNotification({
                        title: 'Proxtop',
                        message: this.translation.get('MESSAGES.NEW_MESSAGE', { user: notification.username }),
                        icon: 'assets/proxtop_logo_256.png'
                    }, () => {
                        windowManager.notifyWindow('state-change', 'message', { id: notification.id });
                    });
                }
            });

            MessageReadCache.clear();
            notifications.forEach((not) => MessageReadCache.markReceived(not.username));

            if(hasMore) {
                LOG.debug("Seems like more messages are available, checking again.");
                this._check();
            }
        });
    }

    _passedInterval() {
        const interval = settings.getGeneralSettings().check_message_interval;
        const time = new Date().getTime();
        return time - this.lastCheck > interval * 60000 - 5000;
    }

    static _isEnabled() {
        return settings.getGeneralSettings().message_notification;
    }
}

module.exports = MessageChecker;