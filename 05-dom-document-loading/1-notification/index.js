export default class NotificationMessage {
    static exist = {}; // notifacation existance flag (shared by all object instances)

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
        if (this.notification.element) {
            this.notification.element.remove();             // remove existing notification element from DOM
            if (this.notification.timerId) {
                clearTimeout(this.notification.timerId);    // cancel timer of that notification element 
            }
        }

        target.append(this.element);

        // set notification existance flag 
        this.notification = {
            element: this.element,
            timerId: setTimeout(() => this.remove(), this.duration)
        }
    }

    // this property returns information provided in the corresponding setter 
    get notification() {
        if (NotificationMessage.exist[this.type] === undefined) {
            NotificationMessage.exist[this.type] = {};
        }
        return NotificationMessage.exist[this.type];
    }

    set notification(elementInfo) {
        /* 
          elementInfo = {
              element: pointer to notification DOM-element,
              timerId: timer connected with element
          }
        */
        NotificationMessage.exist[this.type] = elementInfo;
    }

    remove() {
        this.notification = {}; // reset notification existance flag

        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
    }
}
