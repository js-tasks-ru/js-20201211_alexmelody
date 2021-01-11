import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

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

            if (!column || column.dataset.sortable === 'false') {
                return;
            }

            this.sortOnServer(column.dataset.id, this.sortOrder[column.dataset.order]);
        }
    }

    compareFunction = {
        string: (a, b) => a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' }),
        number: (a, b) => a - b,
    };

    constructor(header, { url }) {
        this.header = header;
        this.url = new URL(BACKEND_URL + '/' + url);;

        this.render();     
    }

    async render() {
        const element = document.createElement('div');
        element.innerHTML = this.gettableHTML(this.header);
        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(element.firstElementChild);
        this.addTableEvents();

        await this.sortOnServer();
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

    gettableHTML(header = [], data = []) {
        return `
        <div data-element="productsContainer" class="products-list__container">
            <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                    ${this.getTableHeaderHTML(header)}
                </div>

                <div data-element="body" class="sortable-table__body">
                    ${this.getTableBodyHTML(data)}
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

    async sortOnServer(sortField = 'title', sortOrder = 'asc') {
        const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
        const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${sortField}"]`);

        // NOTE: Remove sorting arrow from other columns
        allColumns.forEach(column => {
            column.dataset.order = '';
        });

        currentColumn.dataset.order = sortOrder;
        try {
            const sortedData = await this.loadData({
                _sort: sortField,
                _order: sortOrder
            });
    
            this.subElements.body.innerHTML = this.getTableBodyHTML(sortedData);
        } catch (error) {   
        }   
    }

    async loadData({
        _embed = 'subcategory.category',
        _sort = 'title',
        _order = 'asc',
        _start = 0,
        _end = 3 } = {}) {

        this.url.searchParams.set('_embed', _embed);
        this.url.searchParams.set('_sort', _sort);
        this.url.searchParams.set('_order', _order);
        this.url.searchParams.set('_start', _start);
        this.url.searchParams.set('_end', _end);

        return fetchJson(this.url);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.removeTableEvents();
        this.remove();
    }
}


