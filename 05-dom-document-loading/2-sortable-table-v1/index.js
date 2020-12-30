export default class SortableTable {
    subElements = {};
    
    sortDirection = { 
        asc: 1,
        desc: -1,
    };
    
    compareFunction = {
        string: (a, b) => a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'}),
        number: (a, b) => a - b,
    };

    constructor(header, { data }) {
        this.header = header;
        this.data = data;

        this.render();
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.tableHTML;

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(this.element);
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

    getTableHeaderHTML(header, sortField = '', sortOrder = '') {
        return header.map(column => this.getColumnHTML(column, sortField, sortOrder)).join('');
    }

    getColumnHTML({id, title, sortable}, sortField = '', sortOrder = '') {
        const sortArrowHTML = 
            (id === sortField) ?  
            `<span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>`
            : '';

        const dataOrderHTML = (sortable && sortOrder) ? `data-order="${sortOrder}"` : '';

        return `
            <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${dataOrderHTML}>
                <span>${title}</span>
                ${sortArrowHTML}   
            </div>`;
    }

    getTableBodyHTML(data) {
        return data.map(row => this.getRowHTML(row)).join('');
    }

    getRowHTML(row) {
        let source = '';

        const dataHTML = this.header.map(({id, template}) => {

            // if header element has method "template", the corresponding data element is expected to be an array
            if (template && (typeof template === 'function')) {   
                if (row[id][0]) {
                    source = row[id][0].source;
                }
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
        const sortColumn = this.header.find(({ id }) => id === sortField);
        
        if ( !(sortColumn && this.compareFunction[sortColumn.sortType] && this.sortDirection[sortOrder]) ) {
            return;
        }
        
        const direction = this.sortDirection[sortOrder];
        const compare = this.compareFunction[sortColumn.sortType];

        const sortedData = [...this.data].sort((a, b) => direction * compare(a[sortField], b[sortField]));

        this.subElements.header.innerHTML = this.getTableHeaderHTML(this.header, sortField, sortOrder);
        this.subElements.body.innerHTML = this.getTableBodyHTML(sortedData);
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }
}

