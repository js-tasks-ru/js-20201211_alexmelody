export default class NotificationMessage {
    static exist = {}; // notifacation existance flag (relevant for all object instances)

    constructor(message = '', {
        duration = 1000,     // duration of message display in msec
        type = 'success'     // message type: success/error
    } = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;

        const element = document.createElement('div');
        element.innerHTML = this.htmlTemplate;

        this.element = element.firstElementChild;
    }

    get htmlTemplate() {
        return `
        <div class="notification ${this.type}" style="--value:${(this.duration / 1000).toFixed(0)}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                    ${this.message}
                </div>
            </div>
        </div>   
        `;
    }

    show(target = document.body) {
        if ( !this.notificationExists ) {
            target.append(this.element);
            this.notificationExists = true; // set notification existance flag for the specified message type
            setTimeout(() => this.remove(), this.duration);
        }
    }

    get notificationExists() {
        return Boolean(NotificationMessage.exist[this.type]); // check if notification with specified type already exists
    }

    set notificationExists(bool) {
        NotificationMessage.exist[this.type] = bool;
    }

    remove() {
        this.notificationExists = false; // reset notification existance flag

        if ( this.element ) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
    }
}
