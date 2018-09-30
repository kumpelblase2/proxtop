import settings from "../settings";
import windowManager from "../ui/window_manager";
import { Instance as Notification } from "../notification";
import translate from "../translation";
import DelayTracker from "./delay_tracker";
import Log from "../util/log";
import { MessageReadCache } from "../storage";


const LOGIN_ERROR = 3023;

export default class MessageChecker {
    constructor(messageHandler, messageService) {
        this.messages = messageHandler;
        this.messageService = messageService;
        this.running = false;
        this.lastCheck = 0;
        this.lastTimer = null;
        this.translation = translate();
        this.delayTracker = new DelayTracker();
        this.delayTracker.name = "-all message updater-";
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
        }, this.delayTracker.delay);
    }

    _check() {
        this.lastCheck = new Date().getTime();
        Log.info("Check if new messages have arrived...");
        this.messageService.loadLatestMessages().then((update) => {
            const { hasMore, messages: notifications } = update;
            notifications.forEach((notification) => {
                if(!MessageReadCache.hasReceived(notification.username)) {
                    Log.verbose('Got new message from ' + notification.username);
                    Notification.displayNotification({
                        title: 'Proxtop',
                        message: this.translation.get('MESSAGES.NEW_MESSAGE', { user: notification.username }),
                        icon: 'assets/proxtop_logo_256.png'
                    }, () => {
                        windowManager.notifyWindow('state-change', 'message', { id: notification.id });
                    });
                }
            });

            if(notifications.length > 0) {
                this.delayTracker.reset();
            } else {
                this.delayTracker.increase();
            }

            MessageReadCache.clear();
            notifications.forEach((not) => MessageReadCache.markReceived(not.username));

            if(hasMore) {
                Log.debug("Seems like more messages are available, checking again.");
                this._check();
            }
        }).catch(function (error) {
            if (!(error.code && error.code === LOGIN_ERROR)) {
                // rethrow since this is some general other error
                throw error;
            }
            // Don't do anything here. We're not logged in so just try again next time
        });
    }

    _passedInterval() {
        const interval = settings.getGeneralSettings().check_message_interval;
        const intervalMilliseconds = interval * 60000 - 5000;
        const time = new Date().getTime();
        return time - this.lastCheck > intervalMilliseconds;
    }

    static _isEnabled() {
        return settings.getGeneralSettings().message_notification;
    }
}
