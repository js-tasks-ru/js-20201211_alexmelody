export default class SortableTable {
    subElements = {};

    sortDirection = {
        asc: 1,
        desc: -1,
    };

    sortOrder = {
        '': 'desc',      // default value if no order was specified
        asc: 'desc',     // change asc to desc
        desc: 'asc',     // change desc to asc    
    }

    tableEventHandlers = {
        sortColumn: (event) => {
            let column = event.target.closest('[data-id]');

            if (column.dataset.sortable === 'false') {
                return;
            }

            this.sort(column.dataset.id, this.sortOrder[column.dataset.order]);
        }
    }

    compareFunction = {
        string: (a, b) => a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' }),
        number: (a, b) => a - b,
    };

    constructor(header, { data }, sortField = 'title', sortOrder = 'asc') {
        this.header = header;
        this.data = data;

        this.render();
        this.addTableEvents();

        // set default sorting
        this.sort(sortField, sortOrder);
    }    

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.tableHTML;

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(this.element);
    }

    addTableEvents() {
        // add sorting function to the header
        this.subElements.header.addEventListener('pointerdown', this.tableEventHandlers.sortColumn);
    }

    removeTableEvents() {
        this.subElements.header.removeEventListener('pointerdown', this.tableEventHandlers.sortColumn);
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((resultObj, subElement) => {
            resultObj[subElement.dataset.element] = subElement;

            return resultObj;
        }, {});
    }

    get tableHTML() {
        return `
        <div data-element="productsContainer" class="products-list__container">
            <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                    ${this.getTableHeaderHTML(this.header)}
                </div>

                <div data-element="body" class="sortable-table__body">
                    ${this.getTableBodyHTML(this.data)}
                </div>

                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                    <div>
                        <p>No products satisfies your filter criteria</p>
                        <button type="button" class="button-primary-outline">Reset all filters</button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    getTableHeaderHTML(header) {
        return header.map(column => this.getColumnHTML(column)).join('');
    }

    getColumnHTML({ id, title, sortable }) {
        return `
            <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}"}>
                <span>${title}</span>
                ${this.getHeaderSortingArrow()}   
            </div>`;
    }

    getHeaderSortingArrow() {
        return `
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>`;
    }

    getTableBodyHTML(data) {
        return data.map(row => this.getRowHTML(row)).join('');
    }

    getRowHTML(row) {
        let source = '';

        const dataHTML = this.header.map(({ id, template }) => {

            // if header element has method "template", the corresponding data element is expected to be an array
            if (template && (typeof template === 'function')) {
                source = row[id][0]?.source;

                return template(row[id]);
            } else {
                return `<div class="sortable-table__cell">${row[id]}</div>`
            }
        }).join('');

        const href = `a href="${source}"`;

        return `
            <${source ? href : 'div'} class="sortable-table__row">
                ${dataHTML}
            </${source ? 'a' : 'div'}>`;
    }

    sort(sortField = '', sortOrder = 'asc') {
        const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
        const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${sortField}"]`);

        // NOTE: Remove sorting arrow from other columns
        allColumns.forEach(column => {
            column.dataset.order = '';
        });

        currentColumn.dataset.order = sortOrder;

        const sortedData = this.sortData(sortField, sortOrder);
        this.subElements.body.innerHTML = this.getTableBodyHTML(sortedData);
    }

    sortData(sortField, sortOrder) {
        const arr = [...this.data];

        const sortColumn = this.header.find(({ id }) => id === sortField);
        const compare = this.compareFunction[sortColumn?.sortType];
        const direction = this.sortDirection[sortOrder];

        if (!(sortColumn && direction && compare)) {
            return arr;
        }

        return arr.sort((a, b) => direction * compare(a[sortField], b[sortField]));
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.removeTableEvents();
        this.remove();
    }
}
