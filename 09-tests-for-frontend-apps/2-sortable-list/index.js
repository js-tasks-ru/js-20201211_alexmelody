import DraggableItem from './draggableItem.js';

export default class SortableList {

    onPointerDown = event => {
        const item = event.target.closest('li');

        if (!item) {
            return;
        }

        if ('deleteHandle' in event.target.dataset) {

            item.remove();

        } else if ('grabHandle' in event.target.dataset) {

            event.preventDefault();
            item.ondragstart = function () {
                return false;
            };

            document.addEventListener('pointerup', this.onPointerUp);


            this.clone = new DraggableItem(
                item,
                this.element,
                event
            );

        }
    }

    onPointerUp = () => {
        document.removeEventListener('pointerup', this.onPointerUp);

        this.clone.drop();
        this.clone.destroy();
        this.clone = null;
    }

    constructor({
        items = []
    }) {
        this.items = [...items];
        this.render();
    }

    render() {
        const dummyElement = document.createElement('div');

        dummyElement.innerHTML = this.template();

        this.element = dummyElement.firstElementChild;

        this.initEventListeners();
    }

    template() {
        return `       
            <ul class="sortable-list">
                ${this.items.map(item => {
                    item.classList.add('sortable-list__item');
                    return item.outerHTML;
                }).join('')}
            </ul>                       
        `;
    }

    initEventListeners() {
        this.element.addEventListener('pointerdown', this.onPointerDown);
    }

    removeEventListeners() {
        this.element.removeEventListener('pointerdown', this.onPointerDown);
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

//----------------------------------------------------------------------------------------------------------------------------

// export class DraggableItem {
//     targetItem = null;

//     constructor(sourceItem, itemContainer, { clientX, clientY }) {

//         const clientRect = sourceItem.getBoundingClientRect();
//         this.top = clientRect.top;
//         this.left = clientRect.left;

//         // remember event coordinates to calculate the shift when moving an element
//         this.clientX = clientX; 
//         this.clientY = clientY;
        
//         this.listItems = [...itemContainer.children];
//         this.sourceItem = sourceItem;
//         this.lastItem = itemContainer.lastElementChild;
//         this.itemsContainer = itemContainer;  

//         this.render();

//         this.dragAt(clientX, clientY);

//         this.initEventListeners();
//     }

//     initEventListeners() {
//         document.addEventListener('pointermove', this.onPointerMove);
//     }

//     removeEventListeners() {
//         document.removeEventListener('pointermove', this.onPointerMove);
//     }

//     render() {
//         const clone = this.sourceItem.cloneNode(true);
//         clone.classList.add('sortable-list__item_dragging');
//         clone.style.position = 'absolute';
//         this.itemsContainer.append(clone);

//         this.element = clone;
//     }

//     drop() {
//         if (this.targetItem !== this.sourceItem) {

//             if (this.targetItem === this.sourceItem.nextSibling) {

//                 this.itemsContainer.insertBefore(this.sourceItem, this.targetItem.nextSibling);

//             } else if (this.targetItem === this.lastItem) {

//                 this.itemsContainer.append(this.sourceItem);

//             } else {
//                 this.itemsContainer.insertBefore(this.sourceItem, this.targetItem);
//             }
//         }
//         this.togglePlaceholder(this.targetItem);
//     }

//     onPointerMove = (event) => {
//         this.dragAt(event.clientX, event.clientY);
//     }

//     dragAt(clientX, clientY) {
//         this.top += (clientY - this.clientY);
//         this.left += (clientX - this.clientX);

//         this.clientX = clientX;
//         this.clientY = clientY;

//         this.element.style.left = this.left + 'px';
//         this.element.style.top = this.top + 'px';

//         const newTargetItem = this.findTarget();
//         if (this.targetItem !== newTargetItem) {
//             this.togglePlaceholder(newTargetItem);
//             this.togglePlaceholder(this.targetItem);
//         }

//         this.targetItem = newTargetItem;
//     }

//     togglePlaceholder(item) {
//         if (!item) {
//             return;
//         }

//         item.classList.toggle('sortable-list__placeholder');
//     }


//     findTarget() {
//         let target = null;

//         for (const item of this.listItems) {
//             if (item.offsetTop <= this.top) {
//                 target = item;
//             }
//         }
//         return target;
//     }

//     remove() {
//         this.element.remove();
//     }

//     destroy() {
//         this.remove();
//         this.removeEventListeners();
//         this.element = null;
//     }
// }

