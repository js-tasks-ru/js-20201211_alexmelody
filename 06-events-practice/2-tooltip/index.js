class Tooltip {

    tooltipEventHandlers = {
        showTooltip: (event) => {
            const targetElement = event.target;

            const tooltipText = targetElement?.dataset.tooltip;
            if (!tooltipText) {
                return;
            }

            this.render(tooltipText, this.getOffsetX(event), this.getOffsetY(event));
            targetElement.addEventListener('mousemove', this.tooltipEventHandlers.moveTooltip);
        },

        hideTooltip: (event) => {
            this.remove();
            event.target?.removeEventListener('mousemove', this.tooltipEventHandlers.moveTooltip);
        },

        moveTooltip: (event) => {
            this.element.style.left = this.getOffsetX(event);
            this.element.style.top = this.getOffsetY(event);
        },
    }

    constructor() {
        this.createElement();
    }

    createElement() {
        const element = document.createElement('div');
        element.innerHTML = `<div class="tooltip"></div>`;

        this.element = element.firstElementChild;
    }

    initialize(parent = document.body) {
        this.parent = parent;
        this.addParentListeners();
    }

    render(text = '', left = '0px', top = '0px') {
        this.element.textContent = text;
        this.element.style.left = left;
        this.element.style.top = top;

        this.parent.append(this.element);
    }

    getOffsetX( { clientX } ) {
        return `${clientX + 10}px`;
    }

    getOffsetY( { clientY } ) {
        return `${clientY + 7}px`;
    }

    addParentListeners() {
        this.parent.addEventListener('pointerover', this.tooltipEventHandlers.showTooltip);
        this.parent.addEventListener('pointerout', this.tooltipEventHandlers.hideTooltip);
    }

    removeParentListeners() {
        this.parent.removeEventListener('pointerover', this.tooltipEventHandlers.showTooltip);
        this.parent.removeEventListener('pointerout', this.tooltipEventHandlers.hideTooltip);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        this.removeParentListeners();
    }
}

const tooltip = new Tooltip();

export default tooltip;
