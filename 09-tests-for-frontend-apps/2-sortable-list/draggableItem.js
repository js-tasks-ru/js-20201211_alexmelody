export default class DraggableItem {
    shiftX = 0;
    shiftY = 0;

    constructor(sourceItem, itemContainer, { clientX, clientY }) {
 
        this.top = sourceItem.offsetTop + 2;   
        this.left = sourceItem.offsetLeft + 2; 

        // remember event coordinates to calculate the shift when moving an element
        this.clientX = clientX; 
        this.clientY = clientY;
        
        this.listItems = [...itemContainer.children];
        this.sourceItem = sourceItem;
        this.itemsContainer = itemContainer;  

        this.render();
        this.initTarget();
        this.initEventListeners();
    }

    initTarget() {
        this.targetItem = this.sourceItem;
        this.togglePlaceholder(this.targetItem);

        this.element.style.left = this.left + 'px';
        this.element.style.top = this.top + 'px';
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
        this.shiftY = clientY - this.clientY;
        this.shiftX = clientX - this.clientX;

        this.top += this.shiftY;
        this.left += this.shiftX;

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
        item.classList.toggle('sortable-list__placeholder');
    }

    findTarget() {
        return this.shiftY > 0 
            ? this.selectTarget(this.targetItem, this.getNextItem())   // dragging down
            : this.selectTarget(this.getPrevItem(), this.targetItem);  // dragging up      
    }

    selectTarget(upperItem, lowerItem) {
        if (!(upperItem && lowerItem)) {
            return this.targetItem;
        }

        const height = this.targetItem.getBoundingClientRect().height;
        const dragMiddleY = this.top + height / 2;
        const middlePoint = upperItem.offsetTop + height + (upperItem.offsetTop + height - lowerItem.offsetTop) / 2;
        
        return dragMiddleY > middlePoint ? lowerItem : upperItem;
    }
    
    getNextItem() {
        const item = this.targetItem.nextSibling;
        return item === this.element ? null : item;
    }

    getPrevItem() {
        const item = this.targetItem.previousSibling;
        return item === this.element ? null : item;
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