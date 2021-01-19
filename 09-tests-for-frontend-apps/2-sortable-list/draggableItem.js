export default class DraggableItem {
    targetItem = null;

    constructor(sourceItem, itemContainer, { clientX, clientY }) {

        this.top = sourceItem.offsetTop + 2;   
        this.left = sourceItem.offsetLeft + 2; 

        // remember event coordinates to calculate the shift when moving an element
        this.clientX = clientX; 
        this.clientY = clientY;
        
        this.listItems = [...itemContainer.children];
        this.sourceItem = sourceItem;
        this.lastItem = itemContainer.lastElementChild;
        this.itemsContainer = itemContainer;  

        this.render();

        this.dragAt(clientX, clientY);

        this.initEventListeners();
    }

    initEventListeners() {
        document.addEventListener('pointermove', this.onPointerMove);
    }

    removeEventListeners() {
        document.removeEventListener('pointermove', this.onPointerMove);
    }

    render() {
        const clone = this.sourceItem.cloneNode(true);
        clone.classList.add('sortable-list__item_dragging');
        clone.style.position = 'absolute';
        this.itemsContainer.append(clone);

        this.element = clone;
    }

    drop() {
        const targetIndex = this.listItems.indexOf(this.targetItem);
        const sourceIndex = this.listItems.indexOf(this.sourceItem);

        if (targetIndex !== sourceIndex) {

            if (targetIndex > sourceIndex) {

                this.itemsContainer.insertBefore(this.sourceItem, this.targetItem.nextSibling);

            } else if (targetIndex < sourceIndex) {

                this.itemsContainer.insertBefore(this.sourceItem, this.targetItem);
            } 
            else  {

                this.itemsContainer.append(this.sourceItem);          
            }
        }
        this.togglePlaceholder(this.targetItem);
    }

    onPointerMove = (event) => {
        this.dragAt(event.clientX, event.clientY);
    }

    dragAt(clientX, clientY) {
        this.top += (clientY - this.clientY);
        this.left += (clientX - this.clientX);

        this.clientX = clientX;
        this.clientY = clientY;

        this.element.style.left = this.left + 'px';
        this.element.style.top = this.top + 'px';

        const newTargetItem = this.findTarget();
        if (this.targetItem !== newTargetItem) {
            this.togglePlaceholder(newTargetItem);
            this.togglePlaceholder(this.targetItem);
        }

        this.targetItem = newTargetItem;
    }

    togglePlaceholder(item) {
        if (!item) {
            return;
        }

        item.classList.toggle('sortable-list__placeholder');
    }


    findTarget() {
        let target = null;

        for (const item of this.listItems) {
            if (item.offsetTop <= this.top) {
                target = item;
            }
        }
        return target;
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.remove();
        this.removeEventListeners();
        this.element = null;
    }
}